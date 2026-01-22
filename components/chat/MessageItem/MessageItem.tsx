import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Pencil, Reply, Trash2 } from "lucide-react";

import type { UniversalMessage } from "@/hooks/useChatMessages";
import { formatTime } from "@/lib/helpers/formatTime";
import { getAttachmentType } from "@/lib/helpers/getAttachmentType";

import { LinkifiedContent } from "../LinkifiedContent/LinkifiedContent";
import { MessageReactions } from "../MessageReactions/MessageReactions";
import { ReactionButton } from "../ReactionButton/ReactionButton";
import { MessageContextMenu } from "../MessageContextMenu/MessageContextMenu";
import { UserActionsPopover } from "../UserActionsPopover/UserActionsPopover";
import ZoomableImage from "../ZoomableImage/ZoomableImage";
import PlyrVideoPlayer from "@/components/PlyrVideoPlayer/PlyrVideoPlayer";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";

// ============================================================================
// TYPES
// ============================================================================

interface MessageItemProps {
  message: UniversalMessage;
  currentUser: {
    id: string;
    username: string;
    avatar_url: string;
  };
  userMap: { [userId: string]: string };
  onReply: (message: UniversalMessage) => void;
  onEdit: (message: UniversalMessage) => void;
  onDelete: (messageId: number | string) => void;
  onAddReaction: (messageId: number | string, emoji: string) => Promise<void>;
  onMenuAddReaction: (emoji: string, message: UniversalMessage) => void;
  onStartDM: (targetUserId: string) => void;
  onFriendRequest: (targetUserId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  userMap,
  onReply,
  onEdit,
  onDelete,
  onAddReaction,
  onMenuAddReaction,
  onStartDM,
  onFriendRequest,
}) => {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const senderUsername =
    message.users?.username || message.username || "Unknown";
  const senderAvatarUrl = message.users?.avatar_url || null;
  const isMe = message.user_id === currentUser.id;
  const isOptimistic = String(message.id).startsWith("temp-");
  const hasAttachment = !!message.attachment_url;

  const messageSender = {
    id: message.user_id,
    username: senderUsername,
    avatar_url: senderAvatarUrl || "",
  };

  // Obsługa replied_to_message (może być array lub object)
  const repliedMessageData =
    Array.isArray(message.replied_to_message) &&
    message.replied_to_message.length > 0
      ? message.replied_to_message[0]
      : message.replied_to_message;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col w-full group relative mb-4 items-start px-4">
      <div className="flex items-start gap-3 w-full">
        {/* AVATAR z UserActionsPopover */}
        <UserActionsPopover
          user={messageSender}
          currentUser={currentUser}
          handleStartDM={onStartDM}
          handleFriendRequest={onFriendRequest}
        >
          <Avatar className="h-10 w-10 shrink-0 mt-1 shadow-sm">
            <AvatarImage
              src={senderAvatarUrl || undefined}
              alt={senderUsername}
            />
            <AvatarFallback>{senderUsername[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </UserActionsPopover>

        {/* MESSAGE CONTENT */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header - Username + Time */}
          <div className="flex items-baseline gap-2 mb-1">
            <UserActionsPopover
              user={messageSender}
              currentUser={currentUser}
              handleStartDM={onStartDM}
              handleFriendRequest={onFriendRequest}
            >
              <span
                className={`font-semibold text-sm hover:underline hover:cursor-pointer ${
                  isMe ? "text-amber-500" : "text-orange-200"
                }`}
              >
                {senderUsername}
              </span>
            </UserActionsPopover>

            <span className="text-[0.75rem] text-slate-500">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* MESSAGE BUBBLE */}
          <div className="relative w-full max-w-full group/bubble">
            {/* Akcje (hover toolbar) */}
            {!isOptimistic && (
              <div className="absolute -top-5 right-0 z-20 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 flex items-center bg-slate-800 border border-slate-700 rounded-md shadow-sm px-1">
                <ReactionButton
                  msg={message}
                  isMe={isMe}
                  currentUsername={currentUser.username}
                  onAddReaction={onAddReaction}
                />

                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm text-slate-400 hover:text-slate-200"
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Więcej opcji</p>
                    </TooltipContent>
                  </Tooltip>

                  <DropdownMenuContent align="start" side="right">
                    <DropdownMenuItem
                      onClick={() => onReply(message)}
                      className="hover:cursor-pointer"
                    >
                      <Reply size={14} className="mr-2" /> Reply to message
                    </DropdownMenuItem>
                    {isMe && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onEdit(message)}
                          className="text-amber-500 hover:cursor-pointer"
                        >
                          <Pencil size={14} className="mr-2" /> Edit message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(message.id)}
                          className="text-red-500 hover:cursor-pointer"
                        >
                          <Trash2 size={14} className="mr-2" /> Delete message
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Context Menu (PPM) */}
            <MessageContextMenu
              message={message}
              currentUserId={currentUser.id}
              onReply={onReply}
              onDelete={onDelete}
              onAddReaction={onMenuAddReaction}
              onEdit={onEdit}
            >
              <div
                className={`
                  relative flex flex-col px-3 py-2 rounded-md text-sm shadow-sm
                  ${isOptimistic ? "opacity-70" : "opacity-100"}
                  bg-slate-800 text-slate-100 
                `}
              >
                {/* Reply Preview */}
                {repliedMessageData && (
                  <div className="flex items-center gap-2 mb-1 ml-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-8 border-t-2 border-l-2 border-slate-600 rounded-tl-md h-3 -mb-3" />

                    <div className="flex gap-1 text-xs text-slate-400 items-center overflow-hidden">
                      <span className="font-bold text-orange-500 whitespace-nowrap">
                        @{repliedMessageData.username}
                      </span>

                      <span className="truncate italic max-w-[200px]">
                        {repliedMessageData.content
                          ? repliedMessageData.content
                          : "[Załącznik]"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {hasAttachment && message.attachment_url && (
                  <div className="mb-1">
                    {(() => {
                      const attachmentType = getAttachmentType(
                        message.attachment_url
                      );

                      if (attachmentType === "image") {
                        return (
                          <ZoomableImage
                            src={message.attachment_url}
                            alt="Załączony obraz"
                            className={`rounded-lg ${
                              isOptimistic ? "opacity-50" : ""
                            }`}
                          />
                        );
                      } else if (attachmentType === "video") {
                        return (
                          <PlyrVideoPlayer
                            src={message.attachment_url}
                            className={`max-w-xs sm:max-w-sm rounded-lg ${
                              isOptimistic ? "opacity-50" : ""
                            }`}
                          />
                        );
                      } else if (attachmentType === "audio") {
                        return <AudioPlayer src={message.attachment_url} />;
                      } else {
                        return (
                          <a
                            href={message.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            Pobierz plik ({attachmentType})
                          </a>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Text Content */}
                {message.content.trim() || !hasAttachment ? (
                  <div
                    className={`text-sm wrap-break-word whitespace-pre-wrap text-slate-100 ${
                      isOptimistic ? "opacity-50 italic" : ""
                    }`}
                  >
                    <LinkifiedContent text={message.content} />
                  </div>
                ) : null}

                {/* Edited badge */}
                {message.is_edited && !isOptimistic && (
                  <span className="text-[10px] text-slate-500 mt-1">
                    (edytowano)
                  </span>
                )}
              </div>
            </MessageContextMenu>

            {/* Reactions */}
            <div className="mt-1 ml-1">
              <MessageReactions
                messageId={message.id}
                reactions={message.reactions || []}
                isMe={isMe}
                currentUsername={currentUser.username}
                currentUserId={currentUser.id}
                onAddReaction={onAddReaction}
                userMap={userMap}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
