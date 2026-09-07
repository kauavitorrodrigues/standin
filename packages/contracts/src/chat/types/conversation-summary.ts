import type { z } from "zod/v4";
import type { ConversationSummarySchema } from "../schemas/conversation-summary.schema";

export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;
