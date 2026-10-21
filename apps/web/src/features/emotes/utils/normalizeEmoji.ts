const VARIATION_SELECTOR = /️/gu;
const SKIN_TONE = /[\u{1F3FB}-\u{1F3FF}]/gu;

// The emoji without its skin tone and variation selector, so 👍, 👍🏽 and
// the text form of a heart count as the same one.
export const normalizeEmoji = (emoji: string): string =>
    emoji.replace(VARIATION_SELECTOR, "").replace(SKIN_TONE, "");
