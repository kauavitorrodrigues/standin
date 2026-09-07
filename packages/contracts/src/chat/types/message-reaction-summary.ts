import type { z } from "zod/v4";
import type { MessageReactionSummarySchema } from "../schemas/message-reaction-summary.schema";

export type MessageReactionSummary = z.infer<
    typeof MessageReactionSummarySchema
>;
