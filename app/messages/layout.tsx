// app/messages/layout.tsx
import { CustomTrigger } from "@/components/Sidebar/CustomTrigger";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import React, { ReactNode } from "react";

// Interfejs dla propsów layoutu (children to zawsze zawartość page.tsx)
interface MessagesLayoutProps {
  children: ReactNode;
}

// Ten layout będzie renderowany jako Server Component
export default async function MessagesLayout({
  children,
}: MessagesLayoutProps) {
  // W przyszłości tutaj załadujesz listę konwersacji DM z Supabase
  const DMsPlaceholder = [
    { id: "1", name: "Alicja Kowalska" },
    { id: "2", name: "Bartosz Nowak" },
    { id: "3", name: "Dominik Wójcik" },
  ];

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        <Sidebar />
        <CustomTrigger className="md:hidden" />

        {/* Kolumna 2: Zawartość strony (Twoje children to page.tsx) */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}
