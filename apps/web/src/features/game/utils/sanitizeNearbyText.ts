// Control characters, which include line breaks and tabs.
const CONTROL_CHARACTERS = /\p{Cc}/gu;

// The marks that flip the direction of the text (U+202A to U+202E and U+2066 to
// U+2069), with which a peer could turn a message around.
const BIDIRECTIONAL_MARKS = /[‪-‮⁦-⁩]/g;

// The text of a peer made safe to show: no control or direction characters, and
// the spaces folded into single ones. It is still only text, never HTML.
export const sanitizeNearbyText = (text: string): string =>
    text
        .replace(CONTROL_CHARACTERS, " ")
        .replace(BIDIRECTIONAL_MARKS, "")
        .replace(/\s+/g, " ")
        .trim();
