import React from "react";
import Image from "next/image";
import { Paperclip } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UniversalMessage } from "@/hooks/useChatMessages";
import { formatTime } from "@/lib/helpers/formatTime";

interface DeleteMessageDialogProps {
  message: UniversalMessage | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteMessageDialog: React.FC<DeleteMessageDialogProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  if (!message) return null;

  const avatarUrl = message.users?.avatar_url || "";
  const username = message.users?.username || message.username || "Unknown";

  return (
    <AlertDialog open={!!message} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-lg">
            Na pewno usunąć tę wiadomość?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Czy na pewno chcesz usunąć tę wiadomość? Tej operacji nie można
            cofnąć.
          </AlertDialogDescription>

          {/* Podgląd wiadomości */}
          <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-inner flex items-start gap-3">
            {/* Avatar */}
            <div className="relative w-8 h-8 shrink-0 mt-0.5 opacity-70 grayscale">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                  {username[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-slate-300 mb-0.5">
                {username}
                <span className="ml-2 text-[10px] text-slate-500 font-normal">
                  {formatTime(message.created_at)}
                </span>
              </span>
              <p className="text-sm text-slate-300 italic wrap-break-word whitespace-pre-wrap">
                {message.content || (
                  <span className="text-slate-500 text-xs">
                    [Tylko załącznik]
                  </span>
                )}
              </p>
              {/* Informacja o załączniku */}
              {message.attachment_url && (
                <span className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                  <Paperclip size={10} /> Zawiera załącznik
                </span>
              )}
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 border-0"
          >
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
