import { z } from "zod/v4";

export const UnreadCountsSchema = z.object({
    counts: z.record(z.string(), z.number()),
    total: z.number(),
});
