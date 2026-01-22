import React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewMessagesButtonProps {
  count: number;
  onClick: () => void;
}

export const NewMessagesButton: React.FC<NewMessagesButtonProps> = ({
  count,
  onClick,
}) => {
  if (count === 0) return null;

  const text =
    count === 1
      ? "Pojawiła się 1 nowa wiadomość"
      : `Pojawiły się ${count} nowe wiadomości`;

  return (
    <div className="sticky top-4 z-10 w-full flex justify-center pointer-events-none">
      <Button
        onClick={onClick}
        className="pointer-events-auto shadow-lg bg-indigo-600 hover:bg-indigo-700 text-slate-100 transition-all duration-300"
        size="sm"
      >
        {text}
        <ArrowDown size={16} className="ml-2" />
      </Button>
    </div>
  );
};
