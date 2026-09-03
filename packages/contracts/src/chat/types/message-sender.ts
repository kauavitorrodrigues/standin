import type { z } from "zod/v4";
import type { MessageSenderSchema } from "../schemas/message-sender.schema";

export type MessageSender = z.infer<typeof MessageSenderSchema>;
