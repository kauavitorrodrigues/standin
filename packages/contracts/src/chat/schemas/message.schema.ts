import { z } from "zod/v4";
import { MessageErrorMessages } from "./consts/error-messages";
import { MessageDataSchema } from "./message.data.schema";

export const MessageSchema = MessageDataSchema.extend({
    id: z.string({ error: MessageErrorMessages.id.invalid }),
    conversationId: z.string({
        error: MessageErrorMessages.conversationId.invalid,
    }),
    senderId: z.string({ error: MessageErrorMessages.senderId.invalid }),
    createdAt: z.iso.datetime({
        error: MessageErrorMessages.createdAt.invalid,
    }),
    editedAt: z.iso
        .datetime({ error: MessageErrorMessages.editedAt.invalid })
        .nullable(),
});
