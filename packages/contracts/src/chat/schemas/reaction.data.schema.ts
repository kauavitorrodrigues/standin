import { z } from "zod/v4";
import { ReactionErrorMessages } from "./consts/error-messages";
import { MAX_REACTION_EMOJI_LENGTH } from "./consts/fields";

// Extended_Pictographic covers standalone emoji. ZERO WIDTH JOINER (U+200D)
// and VARIATION SELECTOR-16 (U+FE0F) are allowed alongside it because real
// emoji are often multi-codepoint sequences (e.g. "❤️" is HEAVY BLACK HEART
// + VARIATION SELECTOR-16, and family emoji are joined with ZWJ).
const EMOJI_PATTERN = /^(\p{Extended_Pictographic}|\u200D|\uFE0F)+$/u;

export const ReactionDataSchema = z.object({
    emoji: z
        .string({ error: ReactionErrorMessages.emoji.required })
        .trim()
        .min(1, { error: ReactionErrorMessages.emoji.required })
        .max(MAX_REACTION_EMOJI_LENGTH, {
            error: ReactionErrorMessages.emoji.max,
        })
        .regex(EMOJI_PATTERN, { error: ReactionErrorMessages.emoji.invalid }),
});

export type ReactionDataSchemaType = z.infer<typeof ReactionDataSchema>;
