import { z } from "zod/v4";
import { MessageErrorMessages } from "./consts/error-messages";
import { MAX_MESSAGE_CONTENT_LENGTH } from "./consts/fields";

// Unlike MessageDataSchema (create), editing always requires non-empty
// content: there's no attachment step in the edit flow to fall back on.
export const MessageUpdateSchema = z.object({
    content: z
        .string({ error: MessageErrorMessages.content.required })
        .trim()
        .min(1, { error: MessageErrorMessages.content.required })
        .max(MAX_MESSAGE_CONTENT_LENGTH, {
            error: MessageErrorMessages.content.max,
        }),
});

export type MessageUpdateSchemaType = z.infer<typeof MessageUpdateSchema>;
