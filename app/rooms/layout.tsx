import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar/Sidebar";

const RoomsLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar />
      <main className="flex flex-1 justify-between min-w-0 bg-slate-300 text-slate-900 dark:text-slate-100 dark:bg-slate-950 overflow-hidden">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default RoomsLayout;
