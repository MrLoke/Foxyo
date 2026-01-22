import { Reaction } from "@/hooks/useMessagesQuery";

export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface BaseMessage {
  id: number | string;
  content: string;
  user_id: string;
  created_at: string;
  attachment_url?: string | null;
  reactions?: Reaction[];
  is_edited?: boolean;
  replied_to_id?: number | null;
  replied_to_message?: {
    content: string;
    username: string;
    user_id: string;
  } | null;
  users?: User;
  username?: string;
}

export type ChatType = "room" | "dm";
