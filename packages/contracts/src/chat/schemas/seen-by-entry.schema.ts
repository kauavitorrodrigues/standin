import { z } from "zod/v4";
import { MessageSenderSchema } from "./message-sender.schema";

// Same shape as MessageSender, plus when this specific viewer actually read
// the message (message_reads.createdAt). Kept separate from
// MessageSenderSchema because that schema is also reused for `sender`,
// `participants`, and the `users` map, where a read timestamp makes no sense.
export const SeenByEntrySchema = MessageSenderSchema.extend({
    readAt: z.string(),
});
