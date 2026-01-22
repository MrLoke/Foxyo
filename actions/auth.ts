"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignInFormValues } from "@/lib/schemas/authSchema";
import {
  API_HCAPTCHA,
  AUTH_CALLBACK_ROUTE,
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  VERIFY_EMAIL_ROUTE,
} from "@/lib/constants";

export const signInAction = async (formData: SignInFormValues) => {
  const { email, password } = formData;

  if (!email || !password) {
    return { error: "Please enter your email address and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.user) {
    redirect(DASHBOARD_ROUTE);
  }

  if (error) {
    return { error: error.message || "Login error. Please try again." };
  }
};

export const signUpAction = async (formData: FormData) => {
  console.log("🚀 [signUpAction] START");

  try {
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const username = (formData.get("username") as string) || "";
    const avatarFile = formData.get("avatar") as File | null;
    const captcha = formData.get("captcha") as string | null;

    console.log("📝 [signUpAction] Form data:", {
      email,
      username,
      hasAvatar: !!avatarFile,
      avatarSize: avatarFile?.size,
      hasCaptcha: !!captcha,
    });

    // ============================================================================
    // VALIDATION
    // ============================================================================

    if (!email || !password || !username) {
      return { success: false, error: "Missing required fields" };
    }

    if (!captcha) {
      return { success: false, error: "Captcha verification required" };
    }

    // ============================================================================
    // CAPTCHA VERIFICATION
    // ============================================================================

    const verifyRes = await fetch(API_HCAPTCHA, {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: captcha,
      }),
    });

    const captchaJson = await verifyRes.json();

    if (!captchaJson.success) {
      return { success: false, error: "Captcha verification failed" };
    }

    // ============================================================================
    // CREATE USER IN SUPABASE AUTH
    // ============================================================================

    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // To zapisze się w raw_user_meta_data
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${AUTH_CALLBACK_ROUTE}`,
      },
    });

    if (authError) {
      console.error("[signUpAction] Auth error:", authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;

    if (!userId) {
      return { success: false, error: "Failed to create user account" };
    }

    // ============================================================================
    // UPLOAD AVATAR TO STORAGE (if provided)
    // ============================================================================

    let avatar_url: string | null = null;

    if (avatarFile && avatarFile.size > 0) {
      try {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `${userId}/avatar.${ext}`;

        const { error: uploadError } = await admin.storage
          .from("avatars")
          .upload(path, avatarFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: avatarFile.type,
          });

        if (uploadError) {
          console.error("[signUpAction] Avatar upload error:", uploadError);
          // Nie przerywamy rejestracji z powodu błędu avatara
        } else {
          // Pobierz publiczny URL
          const { data: urlData } = admin.storage
            .from("avatars")
            .getPublicUrl(path);

          avatar_url = urlData.publicUrl;
          console.log("[signUpAction] Avatar uploaded:", avatar_url);
        }
      } catch (uploadErr) {
        console.error("[signUpAction] Avatar upload exception:", uploadErr);
        // Nie przerywamy rejestracji
      }
    }

    // ============================================================================
    // CREATE USER PROFILE IN PUBLIC.USERS TABLE
    // ============================================================================

    const { error: userInsertError } = await admin.from("users").upsert(
      [
        {
          id: userId,
          username: username, // ✅ TUTAJ jest właściwy username
          nickname: username, // Możesz to zmienić później w ustawieniach
          avatar_url: avatar_url, // ✅ Avatar URL z Storage
        },
      ],
      {
        onConflict: "id",
        ignoreDuplicates: false, // Zaktualizuj jeśli już istnieje
      }
    );

    if (userInsertError) {
      console.error(
        "[signUpAction] User profile insert error:",
        userInsertError
      );

      // ❌ KRYTYCZNY BŁĄD - usuń użytkownika z Auth jeśli nie udało się utworzyć profilu
      await admin.auth.admin.deleteUser(userId);

      return {
        success: false,
        error: "Failed to create user profile. Please try again.",
      };
    }

    console.log("[signUpAction] User registered successfully:", {
      userId,
      username,
      avatar_url,
    });

    // ============================================================================
    // SUCCESS - REDIRECT TO EMAIL VERIFICATION
    // ============================================================================

    return {
      success: true,
      redirectUrl: VERIFY_EMAIL_ROUTE,
    };
  } catch (error) {
    console.error("[signUpAction] Unexpected error:", error);
    return {
      success: false,
      error:
        error.message || "An unexpected error occurred during registration",
    };
  }
};

export const signInWithMagicLinkAction = async (email: string) => {
  if (!email) {
    return { success: false, error: "Please enter your email address." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${AUTH_CALLBACK_ROUTE}`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Check your email for the magic link to log in!",
  };
};

export const signInWithGoogleAction = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${AUTH_CALLBACK_ROUTE}`,
      scopes: "email profile",
    },
  });

  if (error) {
    return { error: error.message || "Google login error. Please try again." };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Could not generate Google login URL." };
};

export const signOutAction = async () => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Błąd wylogowania:", error);
  }

  redirect(HOME_ROUTE);
};
