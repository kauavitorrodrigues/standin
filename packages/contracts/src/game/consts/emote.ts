// The fewest emojis one emote event floats.
export const EMOTE_COMBO_MIN = 1;

// The most emojis one emote event can float. Cliques in the same emoji inside
// the combo window add up to this, and the receiver clamps to it as well.
export const EMOTE_COMBO_MAX = 4;

// How long a click waits for another click of the same emoji before the
// group goes out.
export const EMOTE_COMBO_WINDOW_MS = 250;

// A single emoji can be a long ZWJ sequence, but never past this many UTF-16
// units. Anything longer is not a real emoji.
export const EMOTE_MAX_LENGTH = 16;
