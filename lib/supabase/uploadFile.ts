import { createClient } from "./client";
import { storeMessage } from "./storeMessages";

// ============================================================================
// TYPES
// ============================================================================

type ChatType = "room" | "direct";

interface BaseUploadArgs {
  file: File;
  currentUsername: string;
  userId: string;
  content?: string;
  repliedToId?: number | null;
  chatType: ChatType;
}

interface RoomUploadArgs extends BaseUploadArgs {
  chatType: "room";
  roomId: string;
}

interface DirectUploadArgs extends BaseUploadArgs {
  chatType: "direct";
  conversationId: string;
  receiverId: string;
}

type UploadFileAndStoreMessageArgs = RoomUploadArgs | DirectUploadArgs;

// ============================================================================
// CONSTANTS
// ============================================================================

const BUCKET_NAME = "chat_attachments";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================================================
// FUNCTION
// ============================================================================

/**
 * Upload pliku do Supabase Storage i zapisanie wiadomości z załącznikiem
 */
export const uploadFileAndStoreMessage = async (
  args: UploadFileAndStoreMessageArgs
) => {
  const {
    file,
    currentUsername,
    userId,
    content = "",
    repliedToId = null,
    chatType,
  } = args;

  const supabase = createClient();

  try {
    // Walidacja rozmiaru pliku
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Generuj unikalną ścieżkę pliku
    const fileExtension = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filePath = `${userId}/${timestamp}_${randomSuffix}.${fileExtension}`;

    // Upload do Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadFile] Storage upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Pobierz publiczny URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // Zapisz wiadomość z załącznikiem
    let storeResult;

    if (chatType === "room") {
      const { roomId } = args as RoomUploadArgs;
      storeResult = await storeMessage({
        content,
        username: currentUsername,
        userId,
        roomId,
        attachmentUrl: publicUrl,
        repliedToId,
        chatType: "room",
      });
    } else {
      const { conversationId, receiverId } = args as DirectUploadArgs;
      storeResult = await storeMessage({
        content,
        username: currentUsername,
        userId,
        conversationId,
        receiverId,
        attachmentUrl: publicUrl,
        repliedToId,
        chatType: "direct",
      });
    }

    // Jeśli zapis wiadomości się nie powiódł, usuń plik ze Storage
    if (!storeResult.success) {
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return { success: false, error: storeResult.error };
    }

    return { success: true, url: publicUrl, data: storeResult.data };
  } catch (err: any) {
    console.error("[uploadFileAndStoreMessage] Unexpected error:", err);
    return { success: false, error: err.message || "Unexpected error" };
  }
};

// ============================================================================
// HELPER - Delete file from storage
// ============================================================================

/**
 * Usuwa plik ze Storage na podstawie URL
 */
export const deleteFileFromStorage = async (fileUrl: string) => {
  const supabase = createClient();

  try {
    // Wyciągnij ścieżkę pliku z URL
    const bucketName = BUCKET_NAME;
    const urlParts = fileUrl.split(`${bucketName}/`);

    if (urlParts.length < 2) {
      return { success: false, error: "Invalid file URL" };
    }

    const filePath = urlParts[1];

    // Usuń plik
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error("[deleteFile] Storage delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error("[deleteFileFromStorage] Unexpected error:", err);
    return { success: false, error: err.message };
  }
};
