import { z } from "zod/v4";
import { MessageErrorMessages } from "./consts/error-messages";
import { MAX_MESSAGE_CONTENT_LENGTH } from "./consts/fields";

export const MessageDataSchema = z.object({
    content: z
        .string({ error: MessageErrorMessages.content.required })
        .trim()
        .min(1, { error: MessageErrorMessages.content.required })
        .max(MAX_MESSAGE_CONTENT_LENGTH, {
            error: MessageErrorMessages.content.max,
        }),
});

export type MessageDataSchemaType = z.infer<typeof MessageDataSchema>;
