import type { Metadata } from "next";
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { SelectLanguage } from "@/components/SelectLanguage/SelectLanguage";
import { CircleArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | Foxyo",
    default: "Authentication Foxyo",
  },
  description: "Log in or register to join Foxyo.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // REMEMBER main styles are inherited from Root Layout
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(110%_110%_at_50%_10%,#cad5e2_40%,#E08116_100%)] dark:bg-[radial-gradient(110%_110%_at_50%_10%,#0f172b_40%,#E08116_100%)] text-white">
      <div className="flex w-full items-center pt-5 px-8">
        <div className="flex">
          <Link href="/">
            <CircleArrowLeft className="h-8 w-8 text-slate-700 dark:text-zinc-300" />
          </Link>
        </div>

        <SelectLanguage />

        <ModeToggle />
      </div>

      {children}
    </main>
  );
}
