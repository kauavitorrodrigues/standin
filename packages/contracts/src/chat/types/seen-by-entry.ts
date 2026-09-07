import type { z } from "zod/v4";
import type { SeenByEntrySchema } from "../schemas/seen-by-entry.schema";

export type SeenByEntry = z.infer<typeof SeenByEntrySchema>;
