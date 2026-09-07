import type { z } from "zod/v4";
import type { UnreadCountsSchema } from "../schemas/unread-counts.schema";

export type UnreadCounts = z.infer<typeof UnreadCountsSchema>;
