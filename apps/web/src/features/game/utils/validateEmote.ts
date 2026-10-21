import {
    EMOTE_COMBO_MAX,
    EMOTE_COMBO_MIN,
    EMOTE_MAX_LENGTH,
    type PeerEmotePayload,
} from "@standin/contracts";

const PICTOGRAPHIC = /\p{Extended_Pictographic}/u;

const graphemeSegmenter = new Intl.Segmenter(undefined, {
    granularity: "grapheme",
});

const countGraphemes = (text: string): number =>
    [...graphemeSegmenter.segment(text)].length;

// Whether the text is exactly one emoji. Flags and keycaps are not
// pictographic on their own, so they are left out, like any plain text.
export const isSingleEmoji = (text: unknown): text is string => {
    if (typeof text !== "string") return false;
    if (text.length === 0 || text.length > EMOTE_MAX_LENGTH) return false;
    if (!PICTOGRAPHIC.test(text)) return false;

    return countGraphemes(text) === 1;
};

// The emote of a peer is not trusted: one emoji, and a count that is a whole
// number from 1 to the combo limit. Returns null when it is not an emote.
export const validateEmote = (data: unknown): PeerEmotePayload | null => {
    if (typeof data !== "object" || data === null) return null;

    const candidate = data as Record<string, unknown>;
    if (!isSingleEmoji(candidate.emoji)) return null;
    if (typeof candidate.count !== "number") return null;
    if (!Number.isFinite(candidate.count)) return null;

    const count = Math.min(
        Math.max(Math.floor(candidate.count), EMOTE_COMBO_MIN),
        EMOTE_COMBO_MAX
    );
    return { emoji: candidate.emoji, count };
};
