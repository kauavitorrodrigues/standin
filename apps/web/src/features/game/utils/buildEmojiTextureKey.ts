import { EMOTE_TEXTURE } from "@/features/game/consts/emote";

// The texture of an emoji, `emote-emoji-{emoji}`.
export const buildEmojiTextureKey = (emoji: string): string =>
    `${EMOTE_TEXTURE.KEY_PREFIX}${emoji}`;
