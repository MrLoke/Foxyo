import { useState } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EyeOff, Eye, LockKeyhole, LockKeyholeOpen } from "lucide-react";

type PasswordFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
};

export const PasswordField = <T extends FieldValues>({
  form,
  name,
}: PasswordFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-600 dark:text-slate-200">
            {name === "passwordConfirm" ? "Confirm password" : "Password"}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {showPassword ? (
                <LockKeyholeOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 h-5 w-5" />
              ) : (
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 h-5 w-5" />
              )}
              <Input
                type={showPassword ? "text" : "password"}
                {...field}
                placeholder={
                  name === "passwordConfirm"
                    ? "Confirm your password"
                    : "Enter your password"
                }
                className={cn(
                  "pl-10 placeholder:text-sm md:placeholder:text-md text-slate-800 dark:text-slate-100",
                  {
                    "border-red-500": form.formState.errors.password,
                  }
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((password) => !password)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
