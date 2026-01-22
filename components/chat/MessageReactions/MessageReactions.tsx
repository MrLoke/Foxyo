import React from "react";

interface UserMap {
  [userId: string]: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  user_ids: string[];
}

interface MessageReactionsProps {
  messageId: number | string;
  reactions: Reaction[];
  currentUserId: string;
  isMe: boolean;
  currentUsername?: string;
  userMap: UserMap;
  onAddReaction: (messageId: number | string, emoji: string) => Promise<void>;
}

// const generateTooltipText = (
//   reaction: Reaction,
//   userMap: UserMap,
//   currentUserId: string
// ): string => {
//   const allUsernames = reaction.user_ids.map(
//     (id) => userMap[id] || "Unknown User"
//   );

//   const reactedByMe = reaction.user_ids.includes(currentUserId);

//   const displayNames = allUsernames.filter((name, index) => {
//     if (name === "Unknown User") return false;
//     if (reactedByMe && reaction.user_ids[index] === currentUserId) return false;
//     return true;
//   });

//   const totalOthersCount = displayNames.length;
//   const namesToShow = displayNames.slice(0, 2);

//   const parts: string[] = [];

//   if (reactedByMe) {
//     parts.push("Ty");
//   }

//   if (namesToShow.length > 0) {
//     parts.push(...namesToShow);
//   }

//   const totalCount = reaction.user_ids.length;
//   const displayedCount = parts.length;
//   const remainder = totalCount - displayedCount;

//   if (remainder > 0) {
//     if (displayedCount === 0) {
//       return `${totalCount} użytkowników`;
//     }
//     parts.push(`i ${remainder} innych`);
//   }

//   if (parts.length === 0) {
//     return "";
//   }

//   return parts.join(", ");
// };

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  isMe,
  currentUserId,
  currentUsername,
  onAddReaction,
  userMap,
}) => {
  const safeReactions = Array.isArray(reactions) ? reactions : [];

  if (safeReactions.length === 0) return null;

  const generateTooltipText = (
    reaction: Reaction,
    userMap: UserMap,
    currentUserId: string
  ): string => {
    const usernames = reaction.user_ids
      .map((id) => userMap?.[id] ?? "Nieznany Użytkownik")
      .filter((name) => name !== "Nieznany Użytkownik");

    const count = usernames.length;

    if (count === 0) return "";
    if (count === 1) return usernames[0];
    if (count === 2) return `${usernames[0]} i ${usernames[1]}`;

    return `${usernames[0]}, ${usernames[1]} i ${count - 2} innych`;
  };

  const handleReactionClick = (emoji: string, userList: string[]) => {
    onAddReaction(messageId, emoji);
  };

  return (
    <div className="absolute flex gap-1 z-10 left-0 -bottom-4">
      {safeReactions.map((reaction) => {
        const reactedByMe = reaction.user_ids.includes(currentUserId);

        return (
          <button
            key={reaction.emoji}
            onClick={() =>
              handleReactionClick(reaction.emoji, reaction.user_ids)
            }
            className={`flex items-center px-1.5 py-0.5 rounded-full text-[10px] shadow-md transition-all ${
              reactedByMe
                ? "bg-slate-400 text-slate-50"
                : "bg-slate-400 text-slate-50"
            }`}
            // title={reaction.user_ids.join(", ")}
            title={generateTooltipText(reaction, userMap, currentUserId)}
          >
            <span className="mr-1 text-sm">{reaction.emoji}</span>
            <span className="font-medium">{reaction.count}</span>
          </button>
        );
      })}
    </div>
  );
};
