import type { z } from "zod/v4";
import type { MessageMentionSchema } from "../schemas/message-mention.schema";

export type MessageMention = z.infer<typeof MessageMentionSchema>;
