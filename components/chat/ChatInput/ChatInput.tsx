import React, { useRef, FormEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Mic, Paperclip, Settings } from "lucide-react";
import { MdEmojiEmotions } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CardFooter } from "@/components/ui/card";

import { FilePreview } from "../FilePreview/FilePreview";
import { ReplyPreview } from "../ReplyPreview/ReplyPreview";
import type { UniversalMessage } from "@/hooks/useChatMessages";

// ============================================================================
// TYPES
// ============================================================================

interface ChatInputProps {
  // Input state
  messageInput: string;
  setMessageInput: (value: string) => void;
  editingMessage: UniversalMessage | null;

  // Reply state
  replyingTo: UniversalMessage | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;

  // File state
  selectedFile: File | null;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;

  // Audio recording
  isRecording: boolean;
  onToggleRecording: () => void;

  // Handlers
  onSubmit: (e: FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  onFileClick: () => void;
  onSettingsClick?: () => void;

  // Other
  chatType: "room" | "direct";
  chatName: string;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ChatInput: React.FC<ChatInputProps> = ({
  messageInput,
  setMessageInput,
  editingMessage,
  replyingTo,
  onCancelReply,
  onCancelEdit,
  selectedFile,
  previewUrl,
  fileInputRef,
  onFileChange,
  onRemoveFile,
  isRecording,
  onToggleRecording,
  onSubmit,
  onInputChange,
  onKeyDown,
  onEmojiClick,
  onFileClick,
  onSettingsClick,
  chatName,
  chatType,
  disabled = false,
}) => {
  // ============================================================================
  // COMPUTED
  // ============================================================================

  const canSubmit = (messageInput.trim() || selectedFile) && !disabled;

  const placeholder = replyingTo
    ? `Reply to ${replyingTo.users?.username || replyingTo.username}`
    : editingMessage
      ? "Edit message..."
      : `Send a message in ${chatName}`;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CardFooter className="px-2 pb-3 [.border-t]:pt-3 bg-slate-900 border-t border-slate-700 flex flex-col shrink-0 rounded-b-3xl">
      {/* File Preview */}
      {selectedFile && previewUrl && (
        <FilePreview
          file={selectedFile}
          previewUrl={previewUrl}
          onRemove={onRemoveFile}
        />
      )}

      {/* Reply Preview */}
      {replyingTo && !editingMessage && (
        <ReplyPreview message={replyingTo} onCancel={onCancelReply} />
      )}

      {/* Edit Mode Banner */}
      {editingMessage && (
        <div className="w-full flex items-center gap-2 mb-2 p-2 bg-amber-900/30 border-l-4 border-amber-500 rounded-md">
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-400">
              Edytujesz wiadomość
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
            className="text-slate-400 hover:text-slate-200"
          >
            Anuluj
          </Button>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col w-full items-center gap-3 p-1 relative"
      >
        {/* Textarea + Emoji Button */}
        <div className="flex-1 flex items-center w-full relative border rounded-2xl bg-slate-600 ring-2 ring-amber-100 focus-within:ring-amber-500 transition-all">
          <TextareaAutosize
            minRows={1}
            maxRows={4}
            maxLength={400}
            placeholder={placeholder}
            value={messageInput}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            className="flex-1 w-full rounded-2xl text-slate-200 border-0 focus:ring-0 resize-none py-2.5 px-3 text-sm max-h-32 outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Emoji Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className="text-slate-500 bg-slate-700 hover:bg-slate-400 mr-1 rounded-full"
              >
                <MdEmojiEmotions size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              className="w-full p-0 border-none shadow-none bg-transparent"
            >
              <EmojiPicker
                theme={Theme.AUTO}
                onEmojiClick={onEmojiClick}
                autoFocusSearch={true}
                lazyLoadEmojis={false}
                searchDisabled={false}
                width={300}
                height={400}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Bottom Buttons Row */}
        <div className="flex flex-1 w-full items-center justify-between">
          {/* Left Side - Action Buttons */}
          <div className="flex gap-2">
            {/* Settings Button */}
            {onSettingsClick && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    disabled={disabled}
                    className="p-2 text-gray-800 bg-orange-200 hover:bg-orange-300 rounded-full transition-colors disabled:opacity-50"
                    onClick={onSettingsClick}
                  >
                    <Settings size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ustawienia czatu</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* File Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={onFileChange}
              accept="image/jpeg, image/png, image/webp, image/avif, audio/*, video/*"
              disabled={disabled}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  disabled={disabled}
                  className="p-2 text-gray-800 bg-orange-200 hover:bg-orange-300 rounded-full transition-colors disabled:opacity-50"
                  onClick={onFileClick}
                >
                  <Paperclip size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dodaj plik</p>
              </TooltipContent>
            </Tooltip>

            {/* Voice Recording Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  disabled={disabled}
                  onClick={onToggleRecording}
                  className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse"
                      : "text-gray-800 bg-orange-200 hover:bg-orange-300"
                  }`}
                  title={
                    isRecording
                      ? "Zatrzymaj nagrywanie"
                      : "Nagraj wiadomość głosową"
                  }
                >
                  {isRecording ? (
                    <div className="h-3 w-3 bg-white rounded-sm" />
                  ) : (
                    <Mic size={20} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isRecording
                    ? "Zatrzymaj nagrywanie"
                    : "Nagraj wiadomość głosową"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right Side - Send Button */}
          <div className="flex">
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="bg-slate-500 hover:bg-slate-600 text-slate-50 dark:text-slate-100 dark:bg-amber-600 dark:hover:bg-amber-700 rounded-full shrink-0 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingMessage ? "Zapisz zmiany" : "Wyślij wiadomość"}
            </Button>
          </div>
        </div>
      </form>
    </CardFooter>
  );
};
