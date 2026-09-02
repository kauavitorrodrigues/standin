import { z } from "zod/v4";
import { ReactionErrorMessages } from "./consts/error-messages";
import { MAX_REACTION_EMOJI_LENGTH } from "./consts/fields";

export const ReactionDataSchema = z.object({
    emoji: z
        .string({ error: ReactionErrorMessages.emoji.required })
        .trim()
        .min(1, { error: ReactionErrorMessages.emoji.required })
        .max(MAX_REACTION_EMOJI_LENGTH, {
            error: ReactionErrorMessages.emoji.max,
        }),
});

export type ReactionDataSchemaType = z.infer<typeof ReactionDataSchema>;
