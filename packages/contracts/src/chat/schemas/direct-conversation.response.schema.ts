import { z } from "zod/v4";
import { ConversationSchema } from "./conversation.schema";

export const DirectConversationResponseSchema = z.object({
    conversation: ConversationSchema,
});
