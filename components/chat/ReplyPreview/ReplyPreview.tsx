import React from "react";
import { X } from "lucide-react";
import type { UniversalMessage } from "@/hooks/useChatMessages";
import { Button } from "@/components/ui/button";

interface ReplyPreviewProps {
  message: UniversalMessage;
  onCancel: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  message,
  onCancel,
}) => {
  const username = message.users?.username || message.username || "Unknown";
  const content = message.content || "[Załącznik]";

  return (
    <div className="w-full flex items-center gap-2 mb-2 p-2 bg-slate-800/50 border-l-4 border-amber-500 rounded-md">
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-semibold text-amber-400">
          Odpowiadasz na wiadomość od @{username}
        </p>
        <p className="text-sm text-slate-300 truncate italic">{content}</p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="shrink-0 h-6 w-6 text-slate-400 hover:text-slate-200"
      >
        <X size={16} />
      </Button>
    </div>
  );
};
