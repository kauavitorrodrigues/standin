import type { z } from "zod/v4";
import type { MessageWithDetailsSchema } from "../schemas/message-with-details.schema";

export type MessageWithDetails = z.infer<typeof MessageWithDetailsSchema>;
