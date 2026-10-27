import { z } from "zod/v4";
import { MessageSchema } from "./message.schema";
import { MessageAttachmentSchema } from "./message-attachment.schema";
import { MessageReactionSummarySchema } from "./message-reaction-summary.schema";
import { SeenByEntrySchema } from "./seen-by-entry.schema";

export const MessageWithDetailsSchema = MessageSchema.extend({
    attachments: z.array(MessageAttachmentSchema),
    reactions: z.array(MessageReactionSummarySchema),
    seenBy: z.array(SeenByEntrySchema),
    // Display-ready thread summary of a top-level message. Zero and null for a
    // message with no replies, and for a reply itself.
    replyCount: z.number().int().min(0),
    lastReplyAt: z.iso.datetime().nullable(),
    lastReplyPreview: z.string().nullable(),
});
