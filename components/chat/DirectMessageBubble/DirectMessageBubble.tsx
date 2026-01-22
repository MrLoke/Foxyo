import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/helpers/formatTime"; // Nasza naprawiona funkcja!

interface DirectMessageBubbleProps {
  content: string;
  createdAt: string;
  isMe: boolean; // Czy to moja wiadomość?
  avatarUrl?: string; // Avatar rozmówcy (opcjonalny dla "mnie")
}

export const DirectMessageBubble = ({
  content,
  createdAt,
  isMe,
  avatarUrl,
}: DirectMessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isMe ? "justify-end" : "justify-start" // KLUCZ: Wyrównanie kontenera
      )}
    >
      <div
        className={cn(
          "flex max-w-[70%] md:max-w-[60%]", // Ograniczamy szerokość dymka
          isMe ? "flex-row-reverse" : "flex-row" // Odwracamy kolejność dla "mnie" (dymek pierwszy, potem opcjonalnie nic)
        )}
      >
        {/* Avatar (pokazujemy tylko dla rozmówcy, dla "mnie" zazwyczaj się ukrywa w trybie Direct, ale można dodać) */}
        {!isMe && (
          <div className="mr-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-slate-300 overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : null}
            </div>
          </div>
        )}

        {/* Sam Dymek */}
        <div
          className={cn(
            "relative px-4 py-2 rounded-2xl text-sm shadow-sm",
            isMe
              ? "bg-primary text-primary-foreground rounded-br-none" // Mój dymek (kolor główny, np. niebieski/czarny zależy od tematu)
              : "bg-muted text-foreground rounded-bl-none" // Dymek rozmówcy (szary)
          )}
        >
          <p className="whitespace-pre-wrap wrap-break-word">{content}</p>

          {/* Data/Godzina */}
          <span
            className={cn(
              "text-[10px] block mt-1 opacity-70",
              isMe ? "text-right" : "text-left"
            )}
          >
            {formatTime(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
