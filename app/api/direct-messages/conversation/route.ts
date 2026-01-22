import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// TYPES
// ============================================================================

interface RequestBody {
  userAId: string;
  userBId: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Znajdź lub utwórz konwersację DM między dwoma użytkownikami
 * @returns conversation_id
 */
async function getOrCreateConversation(
  supabase: any,
  userId1: string,
  userId2: string
): Promise<string> {
  // Sortowanie ID zapewnia spójność (zawsze user1_id < user2_id)
  const [user1_id, user2_id] = [userId1, userId2].sort();

  // 1. Sprawdź czy konwersacja już istnieje
  const { data: existing, error: searchError } = await supabase
    .from("direct_conversations")
    .select("id")
    .eq("user1_id", user1_id)
    .eq("user2_id", user2_id)
    .maybeSingle(); // maybeSingle zamiast single - nie rzuca błędu gdy brak wyników

  if (searchError) {
    throw new Error(`Database search error: ${searchError.message}`);
  }

  if (existing) {
    return existing.id;
  }

  // 2. Utwórz nową konwersację
  const { data: newConvo, error: insertError } = await supabase
    .from("direct_conversations")
    .insert({ user1_id, user2_id })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Failed to create conversation: ${insertError.message}`);
  }

  return newConvo.id;
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: Request) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();
    const { userAId, userBId } = body;

    // Validation
    if (!userAId || !userBId) {
      return NextResponse.json(
        { error: "Missing required fields: userAId and userBId" },
        { status: 400 }
      );
    }

    if (userAId === userBId) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Auth check - verify logged in user matches userAId
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }

    if (user.id !== userAId) {
      return NextResponse.json(
        { error: "Forbidden - user ID mismatch" },
        { status: 403 }
      );
    }

    // Get or create conversation
    const conversationId = await getOrCreateConversation(
      supabase,
      userAId,
      userBId
    );

    return NextResponse.json(
      { conversationId, success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API] Conversation error:", error);

    // Return user-friendly error
    return NextResponse.json(
      {
        error: "Failed to create or retrieve conversation",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
