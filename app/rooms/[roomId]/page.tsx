import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SIGNIN_ROUTE } from "@/lib/constants";
import { ChatRoom } from "@/components/chat/ChatRoom/ChatRoom";

type PageProps = {
  params: {
    roomId: string;
  };
};

const RoomPage = async ({ params }: PageProps) => {
  const { roomId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(SIGNIN_ROUTE);

  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const profileData = {
    id: user.id,
    username:
      currentUserProfile?.username || user.email?.split("@")[0] || "User",
    avatar_url: currentUserProfile?.avatar_url || "",
  };

  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("id", roomId)
    .single();

  if (!room) return <div>The room does not exist.</div>;

  const { data: initialMessages, error: messagesError } = await supabase
    .from("messages")
    .select("*, users(username, avatar_url)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      <section className="flex-1 flex flex-col items-center justify-center bg-slate-950 relative border-r border-slate-800">
        <div className="text-slate-500 text-center">
          <h2 className="text-2xl font-bold">Stream Area</h2>
          <p>Video player will be here</p>
        </div>
      </section>

      {/* Stała szerokość: w-80 (320px) lub w-96 (384px) - jak na Twitchu */}
      <aside className="w-80 xl:w-96 shrink-0 bg-slate-900 h-screen">
        <ChatRoom
          userId={user.id}
          currentUsername={user.user_metadata.username}
          profileData={profileData}
          chatId={roomId}
          chatType="room"
          chatName={room.name}
        />
      </aside>
    </div>
  );
};

export default RoomPage;
