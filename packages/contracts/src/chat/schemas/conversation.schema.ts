import { z } from "zod/v4";
import { CONVERSATION_TYPES } from "../enums/conversation-type";

export const ConversationSchema = z.object({
    id: z.string(),
    type: z.enum(CONVERSATION_TYPES),
});
