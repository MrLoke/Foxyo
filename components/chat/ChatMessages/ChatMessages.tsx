import React from "react";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { UniversalMessage } from "@/hooks/useChatMessages";
import { MessageItem } from "../MessageItem/MessageItem";
import { NewMessagesButton } from "../NewMessagesButton/NewMessagesButton";
import { TypingIndicator } from "../TypingIndicator/TypingIndicator";

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessagesProps {
  // Messages
  messages: UniversalMessage[];

  // Current user
  currentUser: {
    id: string;
    username: string;
    avatar_url: string;
  };

  // User map (dla reakcji - pokazuje kto dodał reakcję)
  userMap: { [userId: string]: string };

  // Scroll state
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  isAtBottom: boolean;
  newMessagesCount: number;
  onScrollToBottom: () => void;

  // Typing
  typingUsers: string[];

  // Message actions
  onReply: (message: UniversalMessage) => void;
  onEdit: (message: UniversalMessage) => void;
  onDelete: (messageId: number | string) => void;
  onAddReaction: (messageId: number | string, emoji: string) => Promise<void>;
  onMenuAddReaction: (emoji: string, message: UniversalMessage) => void;

  // User actions
  onStartDM: (targetUserId: string) => void;
  onFriendRequest: (targetUserId: string) => void;

  // Loading/Error states
  isLoading?: boolean;
  error?: string | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUser,
  userMap,
  scrollAreaRef,
  isAtBottom,
  newMessagesCount,
  onScrollToBottom,
  typingUsers,
  onReply,
  onEdit,
  onDelete,
  onAddReaction,
  onMenuAddReaction,
  onStartDM,
  onFriendRequest,
  isLoading = false,
  error = null,
}) => {
  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <CardContent className="flex-1 overflow-hidden p-0 bg-slate-800">
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-slate-400 text-sm">Ładowanie wiadomości...</p>
          </div>
        </div>
      </CardContent>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <CardContent className="flex-1 overflow-hidden p-0 bg-slate-800">
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <p className="text-red-400 text-sm font-semibold">Błąd ładowania</p>
            <p className="text-slate-500 text-xs">{error}</p>
          </div>
        </div>
      </CardContent>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (messages.length === 0 && !isLoading) {
    return (
      <CardContent className="flex-1 overflow-hidden p-0 bg-slate-800">
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <p className="text-slate-400 text-sm">
              Brak wiadomości. Rozpocznij konwersację! 💬
            </p>
          </div>
        </div>
      </CardContent>
    );
  }

  // ============================================================================
  // MESSAGES LIST
  // ============================================================================

  return (
    <CardContent className="flex-1 overflow-hidden p-0 bg-slate-800">
      <ScrollArea className="h-full w-full pr-4" ref={scrollAreaRef}>
        {/* New Messages Button (floating) */}
        {newMessagesCount > 0 && !isAtBottom && (
          <NewMessagesButton
            count={newMessagesCount}
            onClick={onScrollToBottom}
          />
        )}

        {/* Messages Container */}
        <div className="flex flex-col space-y-4 pt-4 pb-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUser={currentUser}
              userMap={userMap}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddReaction={onAddReaction}
              onMenuAddReaction={onMenuAddReaction}
              onStartDM={onStartDM}
              onFriendRequest={onFriendRequest}
            />
          ))}

          {/* Typing Indicator */}
          <TypingIndicator typingUsers={typingUsers} />
        </div>
      </ScrollArea>
    </CardContent>
  );
};
