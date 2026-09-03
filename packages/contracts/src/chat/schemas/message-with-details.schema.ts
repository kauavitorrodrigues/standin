import { z } from "zod/v4";
import { MessageSchema } from "./message.schema";
import { MessageAttachmentSchema } from "./message-attachment.schema";
import { MessageReactionSummarySchema } from "./message-reaction-summary.schema";

export const MessageWithDetailsSchema = MessageSchema.extend({
    attachments: z.array(MessageAttachmentSchema),
    reactions: z.array(MessageReactionSummarySchema),
});
