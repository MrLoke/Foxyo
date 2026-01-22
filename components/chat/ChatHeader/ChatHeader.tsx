import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { getInitials } from "@/lib/helpers/getInitials";
import { GrStatusGoodSmall } from "react-icons/gr";
import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  chatName: string;
  chatType: "room" | "direct";
  currentUser: {
    username: string;
    avatar_url: string;
  };
  // Opcjonalnie: dla DM możesz przekazać dane drugiego użytkownika
  otherUser?: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatName,
  chatType,
  currentUser,
  otherUser,
}) => {
  return (
    <CardHeader
      className={cn(
        "bg-slate-900/50 border-b border-slate-700 py-3 [.border-b]:pb-3 shrink-0 backdrop-blur-sm gap-0",
        chatType === "direct" ? "rounded-t-3xl" : "rounded-t-none",
      )}
    >
      <CardTitle className="text-sm lg:text-base font-bold flex items-center justify-between">
        {/* Nazwa chatu */}
        <div className="text-slate-200 truncate pr-2 flex items-center gap-2">
          {chatType === "room" ? (
            <>
              <span className="text-slate-500">#</span>
              {chatName}
            </>
          ) : (
            <>
              {/* Dla DM - pokaż awatar drugiego użytkownika */}
              {otherUser && (
                // <Avatar className="w-7 h-7">
                //   <AvatarImage
                //     src={otherUser.avatar_url || undefined}
                //     alt={otherUser.username}
                //   />
                //   <AvatarFallback>
                //     {otherUser.username[0]?.toUpperCase()}
                //   </AvatarFallback>
                // </Avatar>
                <Avatar className="h-8 w-8 rounded-lg">
                  {otherUser?.avatar_url ? (
                    <div className="relative h-8 w-8 rounded-lg overflow-hidden">
                      <Image
                        src={otherUser.avatar_url}
                        alt={otherUser.username}
                        fill
                        sizes="32px"
                        className="object-cover"
                        priority // ✅ Ładuj od razu, bez lazy loading
                        unoptimized // ✅ Opcjonalnie: pomiń optymalizację Next.js (dla Supabase Storage)
                      />
                    </div>
                  ) : (
                    <AvatarFallback className="rounded-lg bg-slate-700 text-slate-200">
                      {getInitials(otherUser.username)}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}

              <div className="flex flex-col">
                <span className="text-slate-300">@{chatName}</span>
                <div className="flex items-center">
                  <GrStatusGoodSmall size={14} fill="green" className="mr-1" />
                  <p className="text-xs text-slate-400">User Status</p>
                </div>
              </div>
            </>
          )}
        </div>

        {chatType === "direct" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <div className="flex hover:cursor-pointer p-1.5 rounded-full hover:bg-slate-700 transition-colors">
                  <EllipsisVertical size={20} />
                </div>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat settings</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Badge zalogowanego użytkownika */}
        {chatType === "room" && (
          <div className="flex items-center text-xs font-normal text-slate-400 bg-slate-800/50 pl-2 pr-1 py-0.5 rounded-full border border-slate-700">
            <span className="truncate max-w-20">{currentUser.username}</span>
            <Avatar className="w-6 h-6 ml-2">
              <AvatarImage
                src={currentUser.avatar_url}
                alt={currentUser.username}
              />
              <AvatarFallback>
                {currentUser.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </CardTitle>
    </CardHeader>
  );
};
