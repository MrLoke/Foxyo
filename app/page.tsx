import Link from "next/link";
import { SIGNIN_ROUTE, SIGNUP_ROUTE } from "@/lib/constants";
import { AuroraBackground } from "@/components/AuroraBackground/AuroraBackground";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { SelectLanguage } from "@/components/SelectLanguage/SelectLanguage";

const Index = () => {
  return (
    <div className="flex flex-col items-center bg-slate-900 text-slate-50">
      <AuroraBackground />

      <div className="flex w-full items-center px-8 mb-12 justify-end">
        <SelectLanguage />

        <ModeToggle />
      </div>

      <section className="flex flex-col items-center min-h-screen bg-slate-900 text-slate-50 px-8">
        <h1 className="text-3xl text-center sm:text-4xl md:text-6xl font-extrabold mb-4 font-suse text-transparent bg-clip-text bg-linear-to-r from-slate-200 to-slate-400">
          Welcome to Foxyo
        </h1>
        <p className="text-base sm:text-lg md:text-2xl font-suse text-slate-400 max-w-2xl text-center mb-10">
          Foxyo is a modern platform for chatting and seamless voice & video
          conversations, designed for communities, teams, and spontaneous
          meetups. Join virtual rooms, talk without interruptions, and connect
          with others — with no delays and no unnecessary complexity.
        </p>
        <div className="flex justify-center items-center flex-col sm:flex-row sm:space-x-4 gap-3 sm:gap-0">
          <Link href={SIGNUP_ROUTE} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-slate-50 text-sm sm:text-base font-bold py-3 px-6 md:py-4 md:px-8 rounded-lg md:text-lg transition-colors">
              Create new account
            </button>
          </Link>
          <Link href={SIGNIN_ROUTE} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto border border-slate-600 text-slate-400 hover:text-slate-50 hover:bg-slate-800 text-sm sm:text-base font-bold py-3 px-6 md:py-4 md:px-8 rounded-lg md:text-lg transition-colors">
              Sign in to Foxyo
            </button>
          </Link>
        </div>

        <p className="mt-12 text-slate-500">More content...</p>
      </section>
    </div>
  );
};

export default Index;
