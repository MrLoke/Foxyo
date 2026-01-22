import Link from "next/link";
import type { Metadata } from "next";
import { SIGNIN_ROUTE } from "@/lib/constants";
import { AnimatedFoxyoLogo } from "@/components/AnimatedVoxioLogo/AnimatedVoxioLogo";
import { SignUpEmailForm } from "@/components/auth/forms/SignUpEmailForm";
import ShowcaseSection from "@/components/auth/ShowcaseSection";

export const metadata: Metadata = {
  title: "Sign Up",
};

const SignUpPage = () => {
  return (
    <div className="min-h-screen w-full flex overflow-y-auto bg-[radial-gradient(115%_115%_at_50%_10%,#cad5e2_40%,#E08116_100%)] dark:bg-[radial-gradient(110%_110%_at_50%_10%,#0f172b_40%,#E08116_100%)]">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 text-zinc-50 pt-20 pb-24">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center">
            <AnimatedFoxyoLogo />
            <h1 className="md:text-3xl text-2xl text-center font-bold font-suse mb-8 text-app-primary">
              Create an account at Foxyo
            </h1>
          </div>

          <SignUpEmailForm />

          <p className="mt-4 text-slate-700 dark:text-slate-300 text-center">
            Already have an account?{" "}
            <Link
              href={SIGNIN_ROUTE}
              className="text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-slate-50 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 overflow-hidden">
        <ShowcaseSection />
      </div>
    </div>
  );
};

export default SignUpPage;
