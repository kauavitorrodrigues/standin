import type { z } from "zod/v4";
import type { ConversationSchema } from "../schemas/conversation.schema";

export type Conversation = z.infer<typeof ConversationSchema>;
