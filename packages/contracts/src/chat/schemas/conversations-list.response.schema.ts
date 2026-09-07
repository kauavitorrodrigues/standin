import { z } from "zod/v4";
import { ConversationSummarySchema } from "./conversation-summary.schema";

export const ConversationsListResponseSchema = z.object({
    conversations: z.array(ConversationSummarySchema),
});
