import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BsChatDotsFill } from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa6";
import { GrStatusGoodSmall } from "react-icons/gr";

interface UserActionsPopoverProps {
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  currentUser: { id: string };
  handleStartDM: (targetUserId: string) => void;
  handleFriendRequest: (targetUserId: string) => void;
  children: React.ReactNode;
}

export const UserActionsPopover = ({
  user,
  currentUser,
  handleStartDM,
  handleFriendRequest,
  children,
}: UserActionsPopoverProps) => {
  if (user.id === currentUser.id) {
    return <>{children}</>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          {children}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 bg-slate-900 border-slate-700 text-slate-100 shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-lg leading-none">
                {user.username}
              </h4>
              <div className="flex items-center mt-1">
                <GrStatusGoodSmall size={16} fill="green" />
                <p className="text-sm text-slate-400 ml-1">User Status</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-700 w-full" />

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full justify-start gap-2 bg-amber-600 hover:bg-amber-700 text-slate-100"
              onClick={() => handleStartDM(user.id)}
            >
              <BsChatDotsFill size={16} /> Send a private message
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start gap-2 bg-slate-700 hover:bg-slate-800 text-slate-200"
              onClick={() => handleFriendRequest(user.id)}
            >
              <FaUserPlus size={16} /> Add to friends
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
