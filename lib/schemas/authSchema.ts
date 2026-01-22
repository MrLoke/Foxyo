import { z } from "zod";
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MAX_UPLOAD_AVATAR_SIZE,
} from "../constants";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-mail address is required." })
    .pipe(z.email({ message: "Invalid e-mail address format." })),

  password: z
    .string()
    .min(1, { message: "Password is required." })
    .min(MIN_PASSWORD_LENGTH, {
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} character long.`,
    })
    .max(MAX_PASSWORD_LENGTH, {
      message: `The password must be at most ${MAX_PASSWORD_LENGTH} characters long.`,
    }),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signInWithMagicLinkSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-mail address is required." })
    .pipe(z.email({ message: "Invalid e-mail address format." })),
});

export type SignInWithMagicLinkFormValues = z.infer<
  typeof signInWithMagicLinkSchema
>;

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "E-mail address is required." })
      .pipe(z.email({ message: "Invalid e-mail address format." })),

    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, { message: "Username is required." })
      .max(MAX_USERNAME_LENGTH, {
        message: `Username is too long (max ${MAX_USERNAME_LENGTH} characters).`,
      }),

    password: z
      .string()
      .min(1, { message: "Password is required." })
      .min(MIN_PASSWORD_LENGTH, {
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} character long.`,
      })
      .max(MAX_PASSWORD_LENGTH, {
        message: `The password must be at most ${MAX_PASSWORD_LENGTH} characters long.`,
      }),

    passwordConfirm: z
      .string()
      .min(1, { message: "Password confirmation is required." }),

    avatarUrl: z
      .any()
      .refine(
        (file) =>
          !file ||
          (file instanceof File && file.size <= MAX_UPLOAD_AVATAR_SIZE),
        {
          message: "File size must be less than 5MB.",
        }
      )
      .optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "The passwords do not match.",
    path: ["passwordConfirm"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
