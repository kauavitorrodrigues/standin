import { z } from "zod/v4";
import { CONVERSATION_TYPES } from "../enums/conversation-type";
import { MessageSenderSchema } from "./message-sender.schema";

const ConversationLastMessageSchema = z.object({
    id: z.string(),
    content: z.string().nullable(),
    senderId: z.string(),
    createdAt: z.iso.datetime(),
});

export const ConversationSummarySchema = z.object({
    id: z.string(),
    type: z.enum(CONVERSATION_TYPES),
    spaceId: z.string().nullable(),
    // Only populated for DIRECT conversations (the other participant(s)),
    // so the client can render a name/avatar without another request.
    // SPACE conversations resolve their display name from the space itself.
    participants: z.array(MessageSenderSchema),
    lastMessage: ConversationLastMessageSchema.nullable(),
    unreadCount: z.number(),
});
