import type { z } from "zod/v4";
import type { UserSummarySchema } from "../schemas/user-summary.schema";

export type UserSummary = z.infer<typeof UserSummarySchema>;
