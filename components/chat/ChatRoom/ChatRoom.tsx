"use client";

import React, {
  useState,
  useCallback,
  FormEvent,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

// Hooks
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import type { UniversalMessage } from "@/hooks/useChatMessages";

// Components
import { ChatHeader } from "../ChatHeader/ChatHeader";
import { ChatMessages } from "../ChatMessages/ChatMessages";
import { ChatInput } from "../ChatInput/ChatInput";
import { DeleteMessageDialog } from "../DeleteMessageDialog/DeleteMessageDialog";

// Utils
import { createClient } from "@/lib/supabase/client";
import { storeMessage } from "@/lib/supabase/storeMessages";
import { uploadFileAndStoreMessage } from "@/lib/supabase/uploadFile";

// ============================================================================
// TYPES
// ============================================================================

interface ChatRoomProps {
  // User data
  userId: string;
  currentUsername: string;
  profileData: {
    id: string;
    username: string;
    avatar_url: string;
  };

  // Chat identification
  chatId: string; // room_id or conversation_id
  chatType: "room" | "direct";
  chatName: string; // nazwa pokoju lub username drugiego użytkownika

  // Dla DM - dane drugiego użytkownika
  otherUser?: {
    id: string; // WAŻNE: potrzebujemy ID do wysyłania wiadomości
    username: string;
    avatar_url: string | null;
  } | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ChatRoom: React.FC<ChatRoomProps> = ({
  userId,
  currentUsername,
  profileData,
  chatId,
  chatType,
  chatName,
  otherUser,
}) => {
  const router = useRouter();
  const supabase = createClient();

  // ============================================================================
  // STATE - Message editing/replying
  // ============================================================================

  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<UniversalMessage | null>(
    null,
  );
  const [replyingTo, setReplyingTo] = useState<UniversalMessage | null>(null);
  const [messageToDelete, setMessageToDelete] =
    useState<UniversalMessage | null>(null);

  // Typing timeout
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // CUSTOM HOOKS
  // ============================================================================

  // Messages & profiles
  const {
    messages,
    profiles,
    isLoading,
    error,
    setMessages,
    addOptimisticMessage,
    replaceOptimisticMessage,
    removeOptimisticMessage,
    updateMessage,
    deleteMessage,
    addReaction,
  } = useChatMessages({
    chatId,
    chatType,
    currentUserId: userId,
  });

  // Scroll management
  const { scrollAreaRef, isAtBottom, newMessagesCount, scrollToBottom } =
    useChatScroll({
      messageCount: messages.length,
    });

  // File upload
  const {
    selectedFile,
    previewUrl,
    fileInputRef,
    handleFileChange,
    removeFile,
    openFilePicker,
    reset: resetFile,
  } = useFileUpload();

  // Audio recording
  const {
    isRecording,
    toggleRecording,
    cleanup: cleanupAudio,
  } = useAudioRecording({
    onRecordingComplete: handleAudioRecordingComplete,
  });

  // Realtime subscriptions
  const { typingUsers, sendTypingEvent } = useRealtimeMessages({
    chatId,
    chatType,
    currentUsername,
    currentUserId: userId,
    onNewMessage: handleNewMessage,
    onUpdateMessage: updateMessage,
  });

  // ============================================================================
  // USER MAP - dla reakcji (pokazuje kto dodał reakcję)
  // ============================================================================

  const userMap = useMemo(() => {
    if (!profiles || profiles.length === 0) return {};
    return profiles.reduce(
      (acc, profile) => {
        acc[profile.id] = profile.username;
        return acc;
      },
      {} as { [userId: string]: string },
    );
  }, [profiles]);

  // ============================================================================
  // HANDLERS - New/Update Messages
  // ============================================================================

  function handleNewMessage(newMessage: UniversalMessage) {
    setMessages((prevMessages) => {
      // Sprawdź czy to replacement dla optimistic message
      const existingTempIndex = prevMessages.findIndex((msg) => {
        if (typeof msg.id === "string" && String(msg.id).startsWith("temp-")) {
          return (
            msg.content === newMessage.content &&
            String(msg.user_id) === String(newMessage.user_id)
          );
        }
        return false;
      });

      if (existingTempIndex > -1) {
        return prevMessages.map((msg, i) =>
          i === existingTempIndex ? newMessage : msg,
        );
      }

      // Sprawdź czy wiadomość już istnieje
      const exists = prevMessages.some(
        (msg) => String(msg.id) === String(newMessage.id),
      );
      if (exists) return prevMessages;

      return [...prevMessages, newMessage];
    });
  }

  // ============================================================================
  // HANDLERS - Audio Recording
  // ============================================================================

  async function handleAudioRecordingComplete(audioFile: File) {
    await uploadFileAndStoreMessage({
      file: audioFile,
      currentUsername,
      userId,
      roomId: chatId, // Działa zarówno dla room_id jak i conversation_id
      content: "",
      chatType: chatType, // FIX IT uploadFileAndStoreMessage
    });
  }

  // ============================================================================
  // HANDLERS - Message Actions
  // ============================================================================

  const handleEdit = useCallback((msg: UniversalMessage) => {
    setEditingMessage(msg);
    setMessageInput(msg.content);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setMessageInput("");
  }, []);

  const handleReply = useCallback((msg: UniversalMessage) => {
    setReplyingTo(msg);
    setMessageInput("");
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleDeleteRequest = useCallback(
    (msgId: number | string) => {
      const msg = messages.find((m) => String(m.id) === String(msgId));
      if (msg) {
        setMessageToDelete(msg);
      }
    },
    [messages],
  );

  const confirmDelete = useCallback(async () => {
    if (!messageToDelete) return;

    const msgId = messageToDelete.id;
    const attachmentUrl = messageToDelete.attachment_url;

    // Optimistic update
    deleteMessage(msgId);
    setMessageToDelete(null);

    try {
      // Usuń załącznik ze Storage (jeśli istnieje)
      if (attachmentUrl) {
        const getFilePathFromUrl = (url: string) => {
          try {
            const bucketName = "chat_attachments";
            const parts = url.split(`${bucketName}/`);
            if (parts.length < 2) return null;
            return parts[1];
          } catch (error) {
            console.error("Błąd parsowania URL:", error);
            return null;
          }
        };

        const filePath = getFilePathFromUrl(attachmentUrl);
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("chat_attachments")
            .remove([filePath]);

          if (storageError) {
            console.error("Błąd usuwania pliku ze Storage:", storageError);
          }
        }
      }

      // Usuń z bazy danych
      const tableName = chatType === "room" ? "messages" : "direct_messages";
      const { error: dbError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", msgId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Błąd podczas usuwania:", error);
      alert("Wystąpił błąd podczas usuwania wiadomości.");
    }
  }, [messageToDelete, supabase, deleteMessage, chatType]);

  const handleMenuAddReaction = useCallback(
    async (emoji: string, message: UniversalMessage) => {
      await addReaction(message.id, emoji);
    },
    [addReaction],
  );

  // ============================================================================
  // HANDLERS - User Actions (DM, Friend Request)
  // ============================================================================

  const handleStartDM = useCallback(
    async (targetUserId: string) => {
      if (!userId || !targetUserId || userId === targetUserId) return;

      try {
        const response = await fetch("/api/direct-messages/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAId: userId,
            userBId: targetUserId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create conversation.");
        }

        const { conversationId } = await response.json();
        router.push(`/messages/${conversationId}`);
      } catch (error) {
        console.error("Błąd DM:", error);
      }
    },
    [userId, router],
  );

  const handleFriendRequest = useCallback((targetUserId: string) => {
    console.log(`Wyślij zaproszenie do ${targetUserId}`);
    alert(`Wysłano zaproszenie do ${targetUserId} (na razie to tylko alert)`);
  }, []);

  // ============================================================================
  // HANDLERS - Input
  // ============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    sendTypingEvent(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingEvent(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  // ============================================================================
  // HANDLER - Submit Message
  // ============================================================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const textInput = messageInput.trim();

    if (!textInput && !selectedFile) return;

    // ============================================================================
    // EDIT MODE
    // ============================================================================
    if (editingMessage) {
      const msgId = editingMessage.id;
      const updatedContent = textInput;

      if (updatedContent === editingMessage.content) {
        cancelEdit();
        return;
      }

      // Optimistic update
      updateMessage({
        ...editingMessage,
        content: updatedContent,
        is_edited: true,
      });

      cancelEdit();

      // Save to DB
      const tableName = chatType === "room" ? "messages" : "direct_messages";
      const { error } = await supabase
        .from(tableName)
        .update({ content: updatedContent, is_edited: true })
        .eq("id", msgId);

      if (error) {
        console.error("Błąd edycji wiadomości:", error);
        alert("Błąd podczas zapisywania edycji.");
      }
      return;
    }

    // ============================================================================
    // SEND NEW MESSAGE
    // ============================================================================

    const content = textInput;
    const fileToSend = selectedFile;

    const repliedToId = replyingTo
      ? typeof replyingTo.id === "string"
        ? null
        : replyingTo.id
      : null;

    // Reset state
    setReplyingTo(null);
    setMessageInput("");
    resetFile();
    sendTypingEvent(false);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: UniversalMessage = {
      id: tempId,
      content: content,
      username: currentUsername,
      user_id: userId,
      created_at: new Date().toISOString(),
      attachment_url: fileToSend ? previewUrl : null,
      reactions: [],
      users: {
        username: currentUsername,
        avatar_url: profileData.avatar_url,
      },
      is_edited: false,
      replied_to_id: repliedToId,
      replied_to_message: replyingTo
        ? {
            content: replyingTo.content,
            username: replyingTo.users?.username || replyingTo.username,
            user_id: replyingTo.user_id,
            attachment_url: replyingTo.attachment_url,
          }
        : null,
      // Dodaj room_id lub sender_id/receiver_id w zależności od typu
      ...(chatType === "room"
        ? { room_id: chatId }
        : { sender_id: userId, receiver_id: "temp" }),
    } as UniversalMessage;

    addOptimisticMessage(optimisticMessage);
    scrollToBottom();

    let success = false;

    // Upload file or send text
    if (fileToSend) {
      if (chatType === "room") {
        const result = await uploadFileAndStoreMessage({
          file: fileToSend,
          currentUsername,
          userId,
          roomId: chatId,
          content: content,
          repliedToId: repliedToId,
          chatType: "room",
        });
        success = result.success;
      } else {
        // Direct message
        if (!otherUser?.id) {
          alert("Błąd: Brak ID odbiorcy");
          removeOptimisticMessage(tempId);
          return;
        }
        const result = await uploadFileAndStoreMessage({
          file: fileToSend,
          currentUsername,
          userId,
          conversationId: chatId,
          receiverId: otherUser.id,
          content: content,
          repliedToId: repliedToId,
          chatType: "direct",
        });
        success = result.success;
      }
    } else {
      if (chatType === "room") {
        const result = await storeMessage({
          content: content,
          username: currentUsername,
          userId: userId,
          roomId: chatId,
          repliedToId: repliedToId,
          chatType: "room",
        });
        success = result.success;
      } else {
        // Direct message
        if (!otherUser?.id) {
          alert("Błąd: Brak ID odbiorcy");
          removeOptimisticMessage(tempId);
          return;
        }
        const result = await storeMessage({
          content: content,
          username: currentUsername,
          userId: userId,
          conversationId: chatId,
          receiverId: otherUser.id,
          repliedToId: repliedToId,
          chatType: "direct",
        });
        success = result.success;
      }
    }

    if (!success) {
      alert("Błąd wysyłania! Wiadomość zostanie usunięta.");
      removeOptimisticMessage(tempId);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-full w-full">
      <Card className="h-full flex flex-col px-0 py-0 gap-0 border-0">
        {/* HEADER */}
        <ChatHeader
          chatName={chatName}
          chatType={chatType}
          currentUser={profileData}
          otherUser={otherUser}
        />

        {/* MESSAGES */}
        <ChatMessages
          messages={messages}
          currentUser={profileData}
          userMap={userMap}
          scrollAreaRef={scrollAreaRef}
          isAtBottom={isAtBottom}
          newMessagesCount={newMessagesCount}
          onScrollToBottom={scrollToBottom}
          typingUsers={typingUsers}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onAddReaction={addReaction}
          onMenuAddReaction={handleMenuAddReaction}
          onStartDM={handleStartDM}
          onFriendRequest={handleFriendRequest}
          isLoading={isLoading}
          error={error}
        />

        {/* INPUT */}
        <ChatInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          editingMessage={editingMessage}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
          onCancelEdit={cancelEdit}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onEmojiClick={onEmojiClick}
          onFileClick={openFilePicker}
          chatType={chatType}
          chatName={chatName}
        />

        {/* DELETE DIALOG */}
        <DeleteMessageDialog
          message={messageToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setMessageToDelete(null)}
        />
      </Card>
    </div>
  );
};
