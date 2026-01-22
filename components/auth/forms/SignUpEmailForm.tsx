"use client";

import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpFormValues } from "@/lib/schemas/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "../ui/PasswordField";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Mail, CircleUserRound } from "lucide-react";
import { signUpAction } from "@/actions/auth";
import { SignUpSocialsForm } from "./SignUpSocialsForm";
import { Separator } from "@/components/ui/separator";

export const SignUpEmailForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // allow external lib ref - narrow typing causes incompatibility with HCaptcha's ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const captchaRef = useRef<any>(null);

  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setServerError(null);

    if (!showCaptcha) {
      setShowCaptcha(true);
      return;
    }

    if (!captchaToken) {
      setServerError("Potwierdź, że nie jesteś botem.");
      return;
    }

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("username", values.username);
    formData.append("password", values.password);
    formData.append("captcha", captchaToken);

    const fileInput = document.getElementById("avatar") as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("avatar", fileInput.files[0]);
    }

    const result = await signUpAction(formData);

    if (result.success) {
      router.push(result.redirectUrl as string);
      return;
    }

    setServerError(
      result.error || "Wystąpił błąd podczas rejestracji po stronie serwera."
    );

    setCaptchaToken(null);

    // safe-call resetCaptcha if available on the ref (use local type assertion)
    (
      captchaRef.current as { resetCaptcha?: () => void } | null
    )?.resetCaptcha?.();
  };

  // wrapper to avoid passing `form.handleSubmit(onSubmit)` inline
  const handleFormSubmit = (e: React.BaseSyntheticEvent) => {
    return form.handleSubmit(onSubmit)(e);
  };

  return (
    <div className="w-full max-w-md">
      {!showEmailForm && (
        <div className="flex mb-4">
          <Button
            onClick={() => setShowEmailForm(true)}
            className="w-full flex items-center bg-slate-100 text-slate-950 hover:bg-slate-200"
          >
            <Mail className="text-slate-950" /> Sign up with e-mail
          </Button>

          {/* <Separator className="my-8 bg-slate-600 dark:bg-slate-600" /> */}
        </div>
      )}

      {showEmailForm ? (
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 dark:text-slate-200">
                    E-mail
                  </FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 h-5 w-5" />
                    <Input
                      type="email"
                      placeholder="E-mail"
                      className={cn(
                        "pl-10 placeholder:text-sm md:placeholder:text-md text-slate-800 dark:text-slate-100",
                        {
                          "border-red-500": form.formState.errors.email,
                        }
                      )}
                      {...field}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 dark:text-slate-200">
                    Username
                  </FormLabel>
                  <div className="relative">
                    <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Your username"
                      className={cn(
                        "pl-10 placeholder:text-sm md:placeholder:text-md text-slate-800 dark:text-slate-100",
                        {
                          "border-red-500": form.formState.errors.username,
                        }
                      )}
                      {...field}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PasswordField form={form} name="password" />
            <PasswordField form={form} name="passwordConfirm" />

            <FormItem>
              <FormLabel className="text-slate-600 dark:text-slate-200">
                Choose your avatar
              </FormLabel>
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hover:cursor-pointer"
              />
            </FormItem>

            <div className="flex justify-center">
              {showCaptcha && (
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={(token) => setCaptchaToken(token)}
                  ref={captchaRef}
                  theme="contrast"
                />
              )}
            </div>

            {serverError && (
              <p className="p-2 bg-red-800 text-white rounded-md text-sm">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-900 ring-2 ring-slate-400 dark:ring-slate-600 text-slate-700 dark:text-slate-200 transition-colors hover:cursor-pointer"
            >
              {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="flex justify-center items-center my-4">
            <Button
              className="w-full bg-slate-50 hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-700 ring-2 ring-slate-400 dark:ring-slate-600 text-slate-700 dark:text-slate-200 transition-colors hover:cursor-pointer"
              onClick={() => setShowEmailForm(false)}
            >
              Continue register with other methods
            </Button>
          </div>
        </Form>
      ) : (
        <SignUpSocialsForm />
      )}
    </div>
  );
};
