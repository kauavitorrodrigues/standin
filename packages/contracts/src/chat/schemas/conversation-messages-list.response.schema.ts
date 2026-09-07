import { z } from "zod/v4";
import { MessageWithDetailsSchema } from "./message-with-details.schema";
import { MessageSenderSchema } from "./message-sender.schema";

export const ConversationMessagesListResponseSchema = z.object({
    messages: z.array(MessageWithDetailsSchema),
    users: z.record(z.string(), MessageSenderSchema),
    nextCursor: z.string().nullable(),
});
