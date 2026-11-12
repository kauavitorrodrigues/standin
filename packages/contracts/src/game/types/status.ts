import type { z } from "zod/v4";
import type { CustomStatusSchema } from "../schemas/realtime";

// What a person is up to, with an emoji and, optionally, when it ends.
export type CustomStatus = z.infer<typeof CustomStatusSchema>;
