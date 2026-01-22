// lib/supabase/directMessages.ts (zapewnij dostęp do Supabase klienta na serwerze)

import { createClient } from "./client";

interface GetOrCreateConversationResult {
  conversationId: string;
}

// Funkcja, która zawsze zwraca ID konwersacji
export async function getOrCreateDirectConversation(
  userId1: string,
  userId2: string
): Promise<GetOrCreateConversationResult> {
  // Supabase nie dba o kolejność, ale my na front-endzie powinniśmy.
  // Sortujemy ID, aby zawsze szukać pod tym samym kluczem (np. A+B zawsze, nigdy B+A)
  const [u1, u2] = [userId1, userId2].sort();

  // 1. Spróbuj znaleźć istniejącą konwersację
  const { data: existingConvo, error: findError } = await createClient()
    .from("direct_conversations")
    .select("id")
    .eq("user1_id", u1)
    .eq("user2_id", u2)
    .single();

  if (findError && findError.code !== "PGRST116") {
    // PGRST116 = brak wyników
    // Obsługa innych błędów
    throw new Error("Błąd szukania konwersacji: " + findError.message);
  }

  if (existingConvo) {
    return { conversationId: existingConvo.id };
  }

  // 2. Jeśli nie znaleziono, utwórz nową konwersację
  const { data: newConvo, error: insertError } = await createClient()
    .from("direct_conversations")
    .insert({ user1_id: u1, user2_id: u2 })
    .select("id")
    .single();

  if (insertError) {
    throw new Error("Błąd tworzenia konwersacji: " + insertError.message);
  }

  return { conversationId: newConvo.id };
}
