import { SOUNDBOARD_ICON_MAX_LENGTH } from "../consts/limits";

// Pictographs, flags (regional indicators) and keycaps. A plain digit or letter
// alone is not an icon, so it needs the icon presentation or a keycap.
const EMOJI_PATTERN =
    /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]️?⃣)/u;

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** True for exactly one emoji, however many code points it is made of. */
export const isSingleEmoji = (value: string): boolean => {
    if (value.length === 0 || value.length > SOUNDBOARD_ICON_MAX_LENGTH) {
        return false;
    }
    const graphemes = [...segmenter.segment(value)];
    return graphemes.length === 1 && EMOJI_PATTERN.test(value);
};
