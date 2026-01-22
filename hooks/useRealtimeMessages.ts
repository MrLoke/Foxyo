import { useCallback, useEffect, useRef, useState } from "react";
import type {
  SupabaseClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UniversalMessage } from "./useChatMessages";

// ============================================================================
// TYPES
// ============================================================================

type UserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export type EnrichedMessage = UniversalMessage & {
  users?: UserProfile | null;
  replied_to_message?: {
    username: string;
    content: string;
    attachment_url: string | null;
    user_id: string;
  } | null;
  client_id?: string | null;
};

type ChatType = "room" | "direct";
type OnMessageFn = (m: EnrichedMessage) => void;

interface UseRealtimeMessagesProps {
  chatId: string; // room_id lub conversation_id
  chatType: ChatType;
  currentUsername: string;
  currentUserId: string;
  onNewMessage: OnMessageFn;
  onUpdateMessage: OnMessageFn;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TYPING_TIMEOUT = 3500;
const supabase: SupabaseClient = createClient();

// ============================================================================
// HOOK
// ============================================================================

export const useRealtimeMessages = ({
  chatId,
  chatType,
  currentUsername,
  currentUserId,
  onNewMessage,
  onUpdateMessage,
}: UseRealtimeMessagesProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentChatRef = useRef<string | null>(null);
  const currentChatTypeRef = useRef<ChatType | null>(null);

  const onNewMessageRef = useRef<OnMessageFn>(onNewMessage);
  const onUpdateMessageRef = useRef<OnMessageFn>(onUpdateMessage);

  const authTokenRef = useRef<string | null>(null);

  const [typingUsersMap, setTypingUsersMap] = useState<Record<string, number>>(
    {},
  );
  const [sessionLoaded, setSessionLoaded] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // ============================================================================
  // UPDATE REFS - zawsze aktualne callbacki
  // ============================================================================

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    onUpdateMessageRef.current = onUpdateMessage;
  }, [onUpdateMessage]);

  // ============================================================================
  // LOAD SESSION - pobierz token autoryzacji
  // ============================================================================

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        authTokenRef.current = data.session?.access_token ?? null;
        setSessionLoaded(true);
      })
      .catch((err) => {
        console.warn("Failed to get supabase session for realtime:", err);
        setSessionLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================================
  // ENRICH MESSAGE - dodaj dane użytkownika i odpowiedzi
  // ============================================================================

  const enrichMessage = useCallback(
    async (raw: any, messageType: ChatType): Promise<EnrichedMessage> => {
      try {
        // Unifikacja - w direct_messages mamy sender_id zamiast user_id
        const userId = messageType === "direct" ? raw.sender_id : raw.user_id;

        let userPromise = Promise.resolve({ data: null, error: null } as any);

        if (userId) {
          userPromise = supabase
            .from("users")
            .select("id, username, avatar_url")
            .eq("id", userId)
            .single();
        }

        let replyPromise = Promise.resolve({ data: null, error: null } as any);

        if (raw.replied_to_id) {
          const replyTable =
            messageType === "room" ? "messages" : "direct_messages";

          const selectColumns =
            messageType === "room"
              ? "username, content, attachment_url, user_id" // messages - tylko user_id
              : "username, content, attachment_url, sender_id"; // direct_messages - tylko sender_id

          replyPromise = supabase
            .from(replyTable)
            .select(selectColumns)
            .eq("id", raw.replied_to_id)
            .single();
        }

        const [userResult, replyResult] = await Promise.all([
          userPromise,
          replyPromise,
        ]);

        const users =
          userResult.data != null
            ? {
                username: userResult.data.username,
                avatar_url: userResult.data.avatar_url,
              }
            : {
                username: raw.username || "Unknown",
                avatar_url: null,
              };

        const repliedToMessage =
          replyResult.data != null
            ? {
                username: replyResult.data.username || "Unknown",
                content: replyResult.data.content || "",
                attachment_url: replyResult.data.attachment_url || null,
                // ✅ POPRAWKA: Pobierz prawidłową kolumnę
                user_id:
                  replyResult.data.user_id || replyResult.data.sender_id || "",
              }
            : null;

        return {
          ...raw,
          user_id: userId,
          username: users.username || raw.username || "Unknown",
          users,
          replied_to_message: repliedToMessage,
        } as EnrichedMessage;
      } catch (err) {
        console.error("Error enriching message:", err);
        return {
          ...raw,
          user_id: raw.user_id || raw.sender_id,
          users: { username: raw.username || "Unknown", avatar_url: null },
          replied_to_message: null,
        } as EnrichedMessage;
      }
    },
    [],
  );

  // ============================================================================
  // HANDLE INSERT PAYLOAD
  // ============================================================================

  const handleInsertPayload = useCallback(
    async (payload: RealtimePostgresChangesPayload<any> | null) => {
      if (!payload || !payload.new) return;
      const raw = payload.new;
      const enriched = await enrichMessage(raw, chatType);
      onNewMessageRef.current(enriched);
    },
    [enrichMessage, chatType],
  );

  // ============================================================================
  // HANDLE UPDATE PAYLOAD
  // ============================================================================

  const handleUpdatePayload = useCallback(
    async (payload: RealtimePostgresChangesPayload<any> | null) => {
      if (!payload || !payload.new) return;
      const raw = payload.new;
      const enriched = await enrichMessage(raw, chatType);
      onUpdateMessageRef.current(enriched);
    },
    [enrichMessage, chatType],
  );

  // ============================================================================
  // TYPING CLEANUP - usuń użytkowników, którzy nie piszą > TYPING_TIMEOUT
  // ============================================================================

  useEffect(() => {
    if (Object.keys(typingUsersMap).length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const next: Record<string, number> = {};
      for (const k of Object.keys(typingUsersMap)) {
        if (now - typingUsersMap[k] < TYPING_TIMEOUT) {
          next[k] = typingUsersMap[k];
        } else {
          changed = true;
        }
      }
      if (changed) setTypingUsersMap(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [typingUsersMap]);

  // ============================================================================
  // REALTIME SUBSCRIPTION - główna logika subskrypcji
  // ============================================================================

  useEffect(() => {
    if (!sessionLoaded || !chatId) return;

    // Jeśli channel już istnieje dla tego samego chatu, nie twórz nowego
    if (
      channelRef.current &&
      currentChatRef.current === chatId &&
      currentChatTypeRef.current === chatType
    ) {
      return;
    }

    // Cleanup poprzedniego channelu
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        /* ignore */
      }
      channelRef.current = null;
      currentChatRef.current = null;
      currentChatTypeRef.current = null;
      queueMicrotask(() => setIsSubscribed(false));
    }

    // Utwórz opcje channelu z autoryzacją
    const options =
      authTokenRef.current != null
        ? {
            config: {
              presence: { key: currentUsername },
              headers: { authorization: `Bearer ${authTokenRef.current}` },
            },
          }
        : undefined;

    // Nazwa channelu i tabela zależą od typu chatu
    const channelName =
      chatType === "room"
        ? `room_messages:${chatId}`
        : `direct_messages:${chatId}`;

    const tableName = chatType === "room" ? "messages" : "direct_messages";

    const ch = supabase.channel(channelName, options);

    // ============================================================================
    // POSTGRES CHANGES - INSERT
    // ============================================================================

    let filterConfig: any = {};

    if (chatType === "room") {
      filterConfig = {
        event: "INSERT",
        schema: "public",
        table: tableName,
        filter: `room_id=eq.${chatId}`,
      };
    } else {
      // Dla DM - musimy filtrować po conversation_id (jeśli masz takie pole)
      // LUB po parze sender_id/receiver_id
      // Zakładam, że masz conversation_id w direct_messages
      filterConfig = {
        // event: "INSERT",
        // schema: "public",
        // table: tableName,
        // Jeśli nie masz conversation_id, możesz filtrować po obu użytkownikach
        // W tym przypadku możesz nie używać filtra i sprawdzać po stronie klienta
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `conversation_id=eq.${chatId}`,
      };
    }

    ch.on("postgres_changes", filterConfig, (payload: any) => {
      void handleInsertPayload(payload);
    });

    // ============================================================================
    // POSTGRES CHANGES - UPDATE
    // ============================================================================

    let updateFilterConfig: any = {};

    if (chatType === "room") {
      updateFilterConfig = {
        event: "UPDATE",
        schema: "public",
        table: tableName,
        filter: `room_id=eq.${chatId}`,
      };
    } else {
      updateFilterConfig = {
        event: "UPDATE",
        schema: "public",
        table: tableName,
      };
    }

    ch.on("postgres_changes", updateFilterConfig, (payload: any) => {
      void handleUpdatePayload(payload);
    });

    // ============================================================================
    // BROADCAST - TYPING
    // ============================================================================

    ch.on("broadcast", { event: "typing" }, (incoming) => {
      try {
        const payload = incoming.payload ?? incoming;
        const user = payload?.user as string | undefined;
        const isTyping = Boolean(
          payload?.isTyping ?? payload?.is_typing ?? payload?.isTyping,
        );
        if (!user || user === currentUsername) return;
        setTypingUsersMap((prev) => {
          const copy = { ...prev };
          if (isTyping) copy[user] = Date.now();
          else delete copy[user];
          return copy;
        });
      } catch {}
    });

    // ============================================================================
    // SUBSCRIBE
    // ============================================================================

    ch.subscribe((status) => {
      const s = String(status);
      const subscribed = s === "SUBSCRIBED" || s === "CHANNEL_JOINED";
      setIsSubscribed(subscribed);
    });

    channelRef.current = ch;
    currentChatRef.current = chatId;
    currentChatTypeRef.current = chatType;

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {
          /* ignore */
        }
        channelRef.current = null;
        currentChatRef.current = null;
        currentChatTypeRef.current = null;
        setIsSubscribed(false);
      }
    };
  }, [
    chatId,
    chatType,
    sessionLoaded,
    currentUsername,
    handleInsertPayload,
    handleUpdatePayload,
  ]);

  // ============================================================================
  // SEND TYPING EVENT
  // ============================================================================

  const sendTypingEvent = useCallback(
    (isTyping: boolean) => {
      const ch = channelRef.current;
      if (!ch || !isSubscribed) return;
      try {
        ch.send({
          type: "broadcast",
          event: "typing",
          payload: { user: currentUsername, isTyping },
        });
        if (isTyping) {
          setTypingUsersMap((prev) => ({
            ...prev,
            [currentUsername]: Date.now(),
          }));
        } else {
          setTypingUsersMap((prev) => {
            const copy = { ...prev };
            delete copy[currentUsername];
            return copy;
          });
        }
      } catch (err) {
        console.warn("Failed to send typing event", err);
      }
    },
    [currentUsername, isSubscribed],
  );

  // ============================================================================
  // RECONNECT
  // ============================================================================

  const reconnect = useCallback(() => {
    if (!currentChatRef.current) return;
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        /* ignore */
      }
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  // ============================================================================
  // TYPING USERS - lista użytkowników piszących (bez nas)
  // ============================================================================

  const typingUsers = Object.keys(typingUsersMap).filter(
    (u) => u !== currentUsername,
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    typingUsers,
    sendTypingEvent,
    isSubscribed,
    reconnect,
  } as const;
};
