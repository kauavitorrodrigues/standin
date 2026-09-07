import { z } from "zod/v4";

export const MessageReactionSummarySchema = z.object({
    emoji: z.string(),
    count: z.number(),
    reactedByMe: z.boolean(),
});