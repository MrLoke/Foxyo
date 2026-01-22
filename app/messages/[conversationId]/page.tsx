import React from "react";
import Link from "next/link";
import { CardFooter } from "@/components/ui/card";
import { ChatRoom } from "@/components/chat/ChatRoom/ChatRoom";
import { createClient } from "@/lib/supabase/server";
import { SIGNIN_ROUTE } from "@/lib/constants";
import { redirect } from "next/navigation";
// Możesz tu dodać 'use client' jeśli potrzebujesz usePathname do podświetlania aktywnego czatu
// lub użyć go w osobnym komponencie Client Component.

interface DMPageProps {
  params: {
    conversationId: string;
  };
}

export default async function DirectMessagePage({ params }: DMPageProps) {
  const { conversationId } = await params;

  const DMsPlaceholder = [
    {
      id: "7bc49892-dc74-4e58-8ad2-b29dc6476954",
      name: "Adam Mickiewicz 21323213213213213213",
    },
    { id: "d8c11e30-b9a4-4a21-88f5-a0c32b5d4e11", name: "Aleksander Nowak" },
    { id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", name: "Michał Grzesiak" },
  ];

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // const currentUserId = user?.id;

  if (!user) redirect(SIGNIN_ROUTE);

  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: conversation } = await supabase
    .from("direct_conversations")
    .select("id, user1_id, user2_id")
    .eq("id", conversationId)
    .single();

  const profileData = {
    id: user.id,
    username:
      currentUserProfile?.username || user.email?.split("@")[0] || "User",
    avatar_url: currentUserProfile?.avatar_url || "",
  };

  const otherUserId =
    conversation?.user1_id === user.id
      ? conversation.user2_id
      : conversation?.user1_id;

  const { data: otherUserProfile } = await supabase
    .from("users")
    .select("username, avatar_url")
    .eq("id", otherUserId)
    .single();

  console.log("[DirectMessagePage] conversation", conversation);
  console.log("[DirectMessagePage] otherUserId", otherUserId);
  console.log("[DirectMessagePage] otherUserProfile", otherUserProfile);

  const otherUsername = otherUserProfile?.username || "Unknown";

  return (
    <div className="flex h-full w-full bg-slate-700 text-slate-100">
      <div className="flex flex-col max-h-screen flex-1 min-w-0 mx-3.5 my-3.5">
        {/* <header className="p-4 bg-slate-800 border-b border-slate-700 shrink-0 rounded-t-3xl">
          <h1 className="text-xl font-bold text-amber-400">
            Czat prywatny z użytkownikiem {otherUsername}
          </h1>
          <p className="text-sm text-slate-400">
            ID Konwersacji: <span className="font-mono">{conversationId}</span>
          </p>
        </header> */}

        <ChatRoom
          userId={user.id}
          currentUsername={user.user_metadata.username}
          profileData={profileData}
          chatId={conversationId}
          chatType="direct"
          chatName={otherUsername}
          otherUser={{
            id: otherUserId,
            username: otherUsername,
            avatar_url: otherUserProfile?.avatar_url || null,
          }}
        />
      </div>

      <aside className="w-80 shrink-0 bg-slate-800 border-l border-slate-700 overflow-y-auto rounded-2xl mr-3.5 my-3.5">
        <header className="p-4 bg-slate-900 sticky top-0 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Wiadomości Prywatne</h2>
        </header>

        <nav className="p-2">
          {DMsPlaceholder.map((dm) => (
            <Link key={dm.id} href={`/messages/${dm.id}`} className="block">
              <div
                className={`p-3 my-1 rounded-lg cursor-pointer transition-colors ${
                  dm.id === conversationId
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "hover:bg-slate-700"
                }`}
              >
                <p className="text-white font-medium">{dm.name}</p>
                <p className="text-sm text-slate-400">
                  Kliknij, aby otworzyć czat...
                </p>
              </div>
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
