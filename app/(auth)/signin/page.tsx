import Link from "next/link";
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/forms/SignInForm";
import { RESET_PASSWORD_ROUTE, SIGNUP_ROUTE } from "@/lib/constants";
import { AnimatedFoxyoLogo } from "@/components/AnimatedVoxioLogo/AnimatedVoxioLogo";
import ShowcaseSection from "@/components/auth/ShowcaseSection";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Sign In",
};

const SignInPage = async () => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-y-auto bg-[radial-gradient(110%_110%_at_50%_10%,#cad5e2_40%,#E08116_100%)] dark:bg-[radial-gradient(110%_110%_at_50%_10%,#0f172b_40%,#E08116_100%)]">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 text-zinc-50 pt-20 pb-24">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center">
            <AnimatedFoxyoLogo />
            <h1 className="md:text-3xl text-2xl text-center font-bold font-suse mb-8 text-app-primary">
              Sign in to Foxyo
            </h1>
          </div>

          <SignInForm />

          <p className="mt-6 text-slate-700 dark:text-slate-300 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href={SIGNUP_ROUTE}
              className="text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-slate-50 font-medium"
            >
              Sign up
            </Link>
          </p>

          <div className="flex flex-col xs:flex-row items-center justify-between mt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Checkbox
                    id="remember-me"
                    className="mr-1 border-2 border-slate-800 checked:bg-app-primary checked:border-app-primary"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-slate-800 dark:text-slate-300 text-base cursor-pointer font-medium"
                  >
                    Keep me signed in
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stay signed in on this device for longer.</p>
              </TooltipContent>
            </Tooltip>

            <Link
              href={RESET_PASSWORD_ROUTE}
              className="text-slate-800 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 mt-2 xs:mt-0 font-medium"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      <div className="flex lg:w-1/2 overflow-hidden">
        <ShowcaseSection />
      </div>
    </div>
  );
};

export default SignInPage;
