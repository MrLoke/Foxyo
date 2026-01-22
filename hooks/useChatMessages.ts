import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface Reaction {
  emoji: string;
  count: number;
  user_ids: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface BaseMessage {
  id: number | string;
  created_at: string;
  content: string;
  user_id: string;
  username: string;
  attachment_url: string | null;
  reactions: Reaction[];
  is_edited?: boolean;
  replied_to_id: number | string | null;
  replied_to_message?: {
    username: string;
    content: string;
    attachment_url: string | null;
  } | null;
  users?: {
    username: string;
    avatar_url: string | null;
  } | null;
}

// Wiadomość z pokoju
export interface RoomMessage extends BaseMessage {
  room_id: string;
}

// Wiadomość prywatna
export interface DirectMessage extends BaseMessage {
  sender_id: string;
  receiver_id: string;
  is_read?: boolean;
}

// Uniwersalny typ - może być z roomu lub DM
export type UniversalMessage = RoomMessage | DirectMessage;

type ChatType = "room" | "direct";

interface UseChatMessagesProps {
  chatId: string; // room_id lub conversation_id
  chatType: ChatType;
  currentUserId: string;
}

// ============================================================================
// HOOK
// ============================================================================

export const useChatMessages = ({
  chatId,
  chatType,
  currentUserId,
}: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<UniversalMessage[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // ============================================================================
  // FETCH MESSAGES - różne query w zależności od typu chatu
  // ============================================================================

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (chatType === "room") {
          // Zapytanie dla pokoju
          const { data, error: fetchError } = await supabase
            .from("messages")
            .select(
              `
                *,
                users!messages_user_id_fkey(username, avatar_url),
                replied_to_message:replied_to_id(
                  username,
                  content,
                  attachment_url,
                  user_id  
                )
              `,
            )
            .eq("room_id", chatId)
            .order("created_at", { ascending: true })
            .limit(50);

          if (fetchError) throw fetchError;
          setMessages((data as RoomMessage[]) || []);
        } else {
          // Zapytanie dla DM - musimy znaleźć konwersację
          const { data: conversation, error: convError } = await supabase
            .from("direct_conversations")
            .select("user1_id, user2_id")
            .eq("id", chatId)
            .single();

          if (convError) throw convError;

          // Pobierz wiadomości z tej konwersacji
          const { data, error: fetchError } = await supabase
            .from("direct_messages")
            .select(
              `
                *,
                users!direct_messages_sender_id_fkey(username, avatar_url),
                replied_to_message:replied_to_id(
                  username,
                  content,
                  attachment_url,
                  sender_id  
                )
              `,
            )
            .or(
              `and(sender_id.eq.${conversation.user1_id},receiver_id.eq.${conversation.user2_id}),and(sender_id.eq.${conversation.user2_id},receiver_id.eq.${conversation.user1_id})`,
            )
            .order("created_at", { ascending: true })
            .limit(50);

          if (fetchError) throw fetchError;

          // Mapuj direct_messages na uniwersalny format
          const mappedMessages = (data || []).map((dm: any) => ({
            ...dm,
            user_id: dm.sender_id, // unifikacja
            username: dm.users?.username || dm.username,
          })) as DirectMessage[];

          setMessages(mappedMessages);
        }
      } catch (err: any) {
        console.error("Error fetching messages:", err);
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, chatType, supabase]);

  // ============================================================================
  // FETCH PROFILES - pobierz wszystkie profile użytkowników w chacie
  // ============================================================================

  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = [
        ...new Set(
          messages.map((msg) => msg.user_id).filter((id): id is string => !!id),
        ),
      ];

      if (userIds.length === 0) return;

      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (error) {
        console.error("Error fetching profiles:", error);
        return;
      }

      if (data) {
        setProfiles(data as UserProfile[]);
      }
    };

    fetchProfiles();
  }, [messages, supabase]);

  // ============================================================================
  // MUTATIONS - uniwersalne metody do modyfikacji wiadomości
  // ============================================================================

  const addOptimisticMessage = useCallback((message: UniversalMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const replaceOptimisticMessage = useCallback(
    (tempId: string | number, realMessage: UniversalMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? realMessage : msg)),
      );
    },
    [],
  );

  const removeOptimisticMessage = useCallback((tempId: string | number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
  }, []);

  const updateMessage = useCallback((updatedMessage: UniversalMessage) => {
    setMessages((prev) =>
      prev.map((msg) =>
        String(msg.id) === String(updatedMessage.id) ? updatedMessage : msg,
      ),
    );
  }, []);

  const deleteMessage = useCallback((messageId: string | number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const addReaction = useCallback(
    async (messageId: number | string, emoji: string) => {
      if (!currentUserId) return;

      // Tablica do wysłania do Supabase
      let reactionsToSend: Reaction[] | undefined;

      // Optymistyczna aktualizacja
      setMessages((prevMessages) => {
        const msgToUpdate = prevMessages.find(
          (msg) => String(msg.id) === String(messageId),
        );

        if (!msgToUpdate) return prevMessages;

        const currentReactions = msgToUpdate.reactions || [];
        const existingReactionIndex = currentReactions.findIndex(
          (r) => r.emoji === emoji,
        );

        let newReactions: Reaction[];

        if (existingReactionIndex > -1) {
          const existingReaction = currentReactions[existingReactionIndex];
          const hasReacted = existingReaction.user_ids
            .map(String)
            .includes(String(currentUserId));

          let updatedUserIds;

          if (hasReacted) {
            // Usuń reakcję
            updatedUserIds = existingReaction.user_ids.filter(
              (id) => String(id) !== String(currentUserId),
            );
          } else {
            // Dodaj reakcję
            updatedUserIds = [...existingReaction.user_ids, currentUserId];
          }

          if (updatedUserIds.length === 0) {
            newReactions = currentReactions.filter((r) => r.emoji !== emoji);
          } else {
            newReactions = currentReactions.map((r, index) =>
              index === existingReactionIndex
                ? {
                    ...r,
                    user_ids: updatedUserIds,
                    count: updatedUserIds.length,
                  }
                : r,
            );
          }
        } else {
          // Nowa reakcja
          newReactions = [
            ...currentReactions,
            {
              emoji,
              user_ids: [currentUserId],
              count: 1,
            },
          ];
        }

        reactionsToSend = newReactions;

        return prevMessages.map((msg) =>
          String(msg.id) === String(messageId)
            ? { ...msg, reactions: newReactions }
            : msg,
        );
      });

      // Zapisz w bazie
      if (reactionsToSend) {
        const tableName = chatType === "room" ? "messages" : "direct_messages";

        const { error } = await supabase
          .from(tableName)
          .update({ reactions: reactionsToSend })
          .eq("id", messageId);

        if (error) {
          console.error("Error updating reactions:", error);
        }
      }
    },
    [currentUserId, chatType, supabase],
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    messages,
    profiles,
    isLoading,
    error,
    setMessages,
    // Mutations
    addOptimisticMessage,
    replaceOptimisticMessage,
    removeOptimisticMessage,
    updateMessage,
    deleteMessage,
    addReaction,
  };
};
