import { z } from "zod/v4";
import { DirectConversationErrorMessages } from "./consts/error-messages";

export const DirectConversationDataSchema = z.object({
    recipientUserId: z
        .string({
            error: DirectConversationErrorMessages.recipientUserId.required,
        })
        .min(1, {
            error: DirectConversationErrorMessages.recipientUserId.required,
        }),
});

export type DirectConversationDataSchemaType = z.infer<
    typeof DirectConversationDataSchema
>;
