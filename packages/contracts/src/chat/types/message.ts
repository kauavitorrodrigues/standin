import type { z } from "zod/v4";
import type { MessageSchema } from "../schemas/message.schema";

export type Message = z.infer<typeof MessageSchema>;
