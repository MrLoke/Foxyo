"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { SiMinutemailer } from "react-icons/si";
import { MdOutlineAttachEmail } from "react-icons/md";
import {
  signInWithGoogleAction,
  signInWithMagicLinkAction,
} from "@/actions/auth";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import {
  SignInWithMagicLinkFormValues,
  signInWithMagicLinkSchema,
} from "@/lib/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
// Możesz użyć 'useToast' lub podobnej biblioteki do wyświetlania komunikatów
// import { useToast } from "@/components/ui/use-toast";

const socialsButtonClasses =
  "w-full flex gap-2 bg-slate-100 text-slate-950 hover:bg-slate-200";

export const SignUpSocialsForm = () => {
  // const { toast } = useToast(); // Przykład użycia hooka
  const [showMagicLinkInput, setShowMagicLinkInput] = useState(false);

  const form = useForm<SignInWithMagicLinkFormValues>({
    resolver: zodResolver(signInWithMagicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  // 1. Obsługa Logowania przez Google (Server Action)
  const handleGoogleLogin = async () => {
    // Wywołujemy funkcję z Server Action. Cała logika OAuth (generowanie URL i redirect)
    // została przeniesiona do pliku actions/auth.ts.
    const result = await signInWithGoogleAction();

    // Jeśli Server Action zwróci błąd (np. błąd połączenia z Supabase)
    if (result && result.error) {
      console.error("Błąd logowania przez Google:", result.error);
      // toast({ title: "Błąd Google", description: result.error });
      alert(`Błąd logowania przez Google: ${result.error}`);
    }
    // Jeśli Server Action jest udany, funkcja signInWithGoogleAction
    // wykona za nas redirect() do Google.
  };

  // 2. Obsługa Magic Link (Server Action)
  // const handleMagicLinkSubmit = async (email: string) => {
  //   // Wywołujemy Server Action do wysłania Magic Linka
  //   const result = await signInWithMagicLinkAction(email);

  //   if (result.success) {
  //     // Wyświetlamy sukces - użytkownik musi sprawdzić maila
  //     alert(result.message);
  //     setShowMagicLinkInput(false); // Ukrywamy formularz
  //   } else if (result.error) {
  //     // Wyświetlamy błąd (np. niepoprawny format maila)
  //     console.error("Błąd Magic Link:", result.error);
  //     alert(`Błąd Magic Link: ${result.error}`);
  //   }
  // };

  const onSubmit = async (values: SignInWithMagicLinkFormValues) => {
    const result = await signInWithMagicLinkAction(values.email);

    if (result && result.error) {
      form.setError("root.serverError", {
        type: "manual",
        message: result.error,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        className={socialsButtonClasses}
        onClick={() => setShowMagicLinkInput(!showMagicLinkInput)}
      >
        <MdOutlineAttachEmail /> Continue with Magic Link
      </Button>

      {showMagicLinkInput && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 h-5 w-5" />
                      <Input
                        type="email"
                        placeholder="E-mail address"
                        className={cn(
                          "pl-10 placeholder:text-sm md:placeholder:text-md text-slate-800 dark:text-slate-100",
                          {
                            "border-red-500": form.formState.errors.email,
                          }
                        )}
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              <SiMinutemailer /> Send link
            </Button>
          </form>
        </Form>
      )}

      <Button className={socialsButtonClasses} onClick={handleGoogleLogin}>
        <FcGoogle /> Continue with Google
      </Button>
    </div>
  );
};
