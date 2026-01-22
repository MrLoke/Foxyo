import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_ERROR_REDIRECT_PATH, DASHBOARD_ROUTE } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";

// ============================================================================
// HELPER: Upsert user profile (tylko jeśli NIE istnieje!)
// ============================================================================

async function handleUserProfileUpsert(userId: string, userMetadata: any) {
  const admin = createAdminClient();

  try {
    // ✅ KROK 1: Sprawdź czy użytkownik już istnieje
    const { data: existingUser, error: checkError } = await admin
      .from("users")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("[callback] Error checking existing user:", checkError);
      return;
    }

    // ✅ KROK 2: Jeśli użytkownik już ma dane, NIE nadpisuj!
    if (existingUser) {
      console.log("[callback] User profile already exists, skipping upsert:", {
        userId,
        username: existingUser.username,
        avatar_url: existingUser.avatar_url,
      });
      return; // ← KLUCZOWE: Wyjdź z funkcji, nie nadpisuj!
    }

    // ✅ KROK 3: Użytkownik NIE istnieje - stwórz profil (np. dla OAuth)
    console.log("[callback] Creating new user profile for OAuth login");

    const displayName =
      userMetadata?.full_name ||
      userMetadata?.name ||
      `user_${userId.slice(0, 8)}`;

    const cleanUsername = displayName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .substring(0, 30);

    const profileData = {
      id: userId,
      username: cleanUsername,
      nickname: displayName,
      avatar_url: userMetadata?.avatar_url || userMetadata?.picture || null,
    };

    const { error: insertError } = await admin
      .from("users")
      .insert([profileData]); // ← INSERT zamiast UPSERT!

    if (insertError) {
      console.error("[callback] Error inserting user profile:", insertError);
    } else {
      console.log("[callback] User profile created successfully:", profileData);
    }
  } catch (err) {
    console.error(
      "[callback] Unexpected error in handleUserProfileUpsert:",
      err
    );
  }
}

// ============================================================================
// MAIN: OAuth Callback Handler
// ============================================================================

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? DASHBOARD_ROUTE;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Exchange code for session
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      const userId = session.user.id;
      const userMetadata = session.user.user_metadata;

      console.log("[callback] Session established for user:", userId);

      // Handle user profile (only creates if doesn't exist)
      await handleUserProfileUpsert(userId, userMetadata);

      // Redirect to dashboard
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Error fallback
  return NextResponse.redirect(
    `${origin}${AUTH_ERROR_REDIRECT_PATH}?error=Invalid or expired verification link.`
  );
}
