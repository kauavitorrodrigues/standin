import type { z } from "zod/v4";
import type { MessageAttachmentSchema } from "../schemas/message-attachment.schema";

export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
