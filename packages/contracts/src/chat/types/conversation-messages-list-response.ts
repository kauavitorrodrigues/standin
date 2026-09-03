import type { z } from "zod/v4";
import type { ConversationMessagesListResponseSchema } from "../schemas/conversation-messages-list.response.schema";

export type ConversationMessagesListResponse = z.infer<
    typeof ConversationMessagesListResponseSchema
>;
