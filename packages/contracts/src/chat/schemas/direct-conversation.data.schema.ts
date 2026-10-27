import { z } from "zod/v4";
import { DirectConversationErrorMessages } from "./consts/error-messages";
import { MAX_DIRECT_CONVERSATION_MEMBERS } from "./consts/fields";

// The recipients exclude the creator. An empty list is the conversation with
// yourself.
export const DirectConversationDataSchema = z.object({
    recipientUserIds: z
        .array(
            z.string({
                error: DirectConversationErrorMessages.recipientUserIds.invalid,
            }).min(1, {
                error: DirectConversationErrorMessages.recipientUserIds.invalid,
            }),
            { error: DirectConversationErrorMessages.recipientUserIds.invalid }
        )
        .max(MAX_DIRECT_CONVERSATION_MEMBERS - 1, {
            error: DirectConversationErrorMessages.recipientUserIds.max,
        }),
});

export type DirectConversationDataSchemaType = z.infer<
    typeof DirectConversationDataSchema
>;
