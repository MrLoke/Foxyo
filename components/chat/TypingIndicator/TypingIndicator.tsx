import React from "react";
import { formatTypingText } from "@/lib/helpers/formatTypingText";

interface TypingIndicatorProps {
  typingUsers: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
}) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="text-sm text-slate-500 ml-12 animate-pulse">
      {formatTypingText(typingUsers)}
    </div>
  );
};
