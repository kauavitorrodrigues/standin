import { z } from "zod/v4";
import { MessageErrorMessages } from "./consts/error-messages";

// A persisted message's content can be null (attachment-only message), so
// this is defined independently from MessageDataSchema, whose `content` is
// an input-validation shape (optional, normalized to undefined).
export const MessageSchema = z.object({
    id: z.string({ error: MessageErrorMessages.id.invalid }),
    conversationId: z.string({
        error: MessageErrorMessages.conversationId.invalid,
    }),
    senderId: z.string({ error: MessageErrorMessages.senderId.invalid }),
    content: z.string().nullable(),
    createdAt: z.iso.datetime({
        error: MessageErrorMessages.createdAt.invalid,
    }),
    editedAt: z.iso
        .datetime({ error: MessageErrorMessages.editedAt.invalid })
        .nullable(),
});
