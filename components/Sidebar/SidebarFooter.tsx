import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "../ui/sidebar";
import { signOutAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import {
  BellRing,
  ChevronsUpDown,
  CircleUserRound,
  LogOut,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { SETTINGS_ROUTE, USER_ACCOUNT_ROUTE } from "@/lib/constants";
import { getInitials } from "@/lib/helpers/getInitials";
import Image from "next/image";

export const SidebarFooterSection = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", user?.id)
    .maybeSingle();

  if (profileError) {
    console.error("Błąd odczytu profilu:", profileError);
  }

  const displayName =
    profileData?.username || user?.user_metadata?.username || "User";
  const displayEmail = user?.email || "";

  return (
    <SidebarMenu className="border-2 rounded-lg">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {profileData?.avatar_url ? (
                  // ✅ ROZWIĄZANIE: Użyj next/image bezpośrednio
                  <div className="relative h-8 w-8 rounded-lg overflow-hidden">
                    <Image
                      src={profileData.avatar_url}
                      alt={displayName}
                      fill
                      sizes="32px"
                      className="object-cover"
                      priority // ✅ Ładuj od razu, bez lazy loading
                      unoptimized // ✅ Opcjonalnie: pomiń optymalizację Next.js (dla Supabase Storage)
                    />
                  </div>
                ) : (
                  // Fallback - pokaże inicjały gdy brak avatara
                  <AvatarFallback className="rounded-lg bg-slate-700 text-slate-200">
                    {getInitials(displayName)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            className="w-[--radix-popper-anchor-width] min-w-50 mb-2 ml-2 rounded-lg"
          >
            <Link href={USER_ACCOUNT_ROUTE} className="flex-auto">
              <DropdownMenuItem className="hover:cursor-pointer">
                <CircleUserRound className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
            </Link>
            <SidebarSeparator />
            <DropdownMenuItem className="hover:cursor-pointer">
              <BellRing className="mr-2 h-4 w-4" />
              <span>Status</span>
            </DropdownMenuItem>
            <SidebarSeparator />
            <Link href={SETTINGS_ROUTE} className="flex-auto">
              <DropdownMenuItem className="hover:cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <SidebarSeparator />
            <DropdownMenuItem asChild>
              <form action={signOutAction} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center hover:cursor-pointer"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
