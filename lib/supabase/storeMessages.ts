import { createClient } from "./client";

// ============================================================================
// TYPES
// ============================================================================

type ChatType = "room" | "direct";

interface BaseMessageArgs {
  content: string;
  username: string;
  userId: string;
  attachmentUrl?: string | null;
  repliedToId?: number | null;
  chatType: ChatType;
}

interface RoomMessageArgs extends BaseMessageArgs {
  chatType: "room";
  roomId: string;
}

interface DirectMessageArgs extends BaseMessageArgs {
  chatType: "direct";
  conversationId: string;
  receiverId: string; // ID drugiego użytkownika
}

type StoreMessageArgs = RoomMessageArgs | DirectMessageArgs;

// ============================================================================
// FUNCTION
// ============================================================================

/**
 * Zapisuje wiadomość do bazy danych (uniwersalna dla rooms i DM)
 */
export const storeMessage = async (messageData: StoreMessageArgs) => {
  const supabase = createClient();

  const {
    content,
    username,
    userId,
    attachmentUrl = null,
    repliedToId = null,
    chatType,
  } = messageData;

  try {
    // Wybierz odpowiednią tabelę
    const tableName = chatType === "room" ? "messages" : "direct_messages";

    // Przygotuj dane do wstawienia
    let dataToInsert: any;

    if (chatType === "room") {
      const { roomId } = messageData as RoomMessageArgs;
      dataToInsert = {
        content,
        username,
        user_id: userId,
        room_id: roomId,
        attachment_url: attachmentUrl,
        replied_to_id: repliedToId,
      };
    } else {
      // Direct message
      const { conversationId, receiverId } = messageData as DirectMessageArgs;
      dataToInsert = {
        content,
        sender_id: userId,
        receiver_id: receiverId,
        conversation_id: conversationId,
        attachment_url: attachmentUrl,
        replied_to_id: repliedToId,
        is_read: false, // Nowa wiadomość zawsze jest nieprzeczytana
      };
    }

    // Insert do bazy
    const { data, error } = await supabase
      .from(tableName)
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error(`[storeMessage] Error in ${tableName}:`, error.message);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data, error: null };
  } catch (err: any) {
    console.error("[storeMessage] Unexpected error:", err);
    return { success: false, data: null, error: err.message };
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Pomocnicza funkcja do aktualizacji statusu "przeczytane" (tylko dla DM)
 */
export const markMessageAsRead = async (messageId: number | string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("direct_messages")
    .update({ is_read: true })
    .eq("id", messageId);

  if (error) {
    console.error("[markMessageAsRead] Error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Pomocnicza funkcja do aktualizacji wiadomości (edycja)
 */
export const updateMessage = async (
  messageId: number | string,
  newContent: string,
  chatType: ChatType
) => {
  const supabase = createClient();
  const tableName = chatType === "room" ? "messages" : "direct_messages";

  const { error } = await supabase
    .from(tableName)
    .update({ content: newContent, is_edited: true })
    .eq("id", messageId);

  if (error) {
    console.error("[updateMessage] Error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Pomocnicza funkcja do usuwania wiadomości
 */
export const deleteMessage = async (
  messageId: number | string,
  chatType: ChatType
) => {
  const supabase = createClient();
  const tableName = chatType === "room" ? "messages" : "direct_messages";

  const { error } = await supabase.from(tableName).delete().eq("id", messageId);

  if (error) {
    console.error("[deleteMessage] Error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};
