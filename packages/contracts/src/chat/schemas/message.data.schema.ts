import { z } from "zod/v4";
import { MessageErrorMessages } from "./consts/error-messages";
import { MAX_MESSAGE_ATTACHMENTS, MAX_MESSAGE_CONTENT_LENGTH } from "./consts/fields";

// content is optional because a message can be attachment-only; an
// empty/whitespace-only string is normalized to undefined so callers only
// need to check truthiness.
export const MessageDataSchema = z.object({
    content: z
        .string({ error: MessageErrorMessages.content.required })
        .trim()
        .max(MAX_MESSAGE_CONTENT_LENGTH, {
            error: MessageErrorMessages.content.max,
        })
        .optional()
        .transform((value) => (value ? value : undefined)),
});

export const SendMessageFormSchema = MessageDataSchema.extend({
    attachments: z.array(z.instanceof(File)).max(MAX_MESSAGE_ATTACHMENTS),
}).refine((data) => data.content !== undefined || data.attachments.length > 0, {
    error: MessageErrorMessages.contentOrAttachment.required,
    path: ["content"],
});

// The transform on `content` (empty string -> undefined) makes the schema's
// input and output shapes diverge, so the form must be typed against both:
// react-hook-form manages values shaped like the input, zodResolver hands
// back values shaped like the output.
export type SendMessageFormInput = z.input<typeof SendMessageFormSchema>;
export type SendMessageFormOutput = z.output<typeof SendMessageFormSchema>;
export type MessageDataSchemaType = z.infer<typeof MessageDataSchema>;