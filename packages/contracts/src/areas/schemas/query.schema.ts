import { z } from "zod/v4";

// Query of GET /library/areas.
export const AreaListQuerySchema = z.object({
    search: z.string().trim().optional(),
});

export type AreaListQuery = z.infer<typeof AreaListQuerySchema>;
