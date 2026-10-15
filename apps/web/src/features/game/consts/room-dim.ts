export const ROOM_DIM = {
    // Slightly bluish dark, like the veil in Gather.
    COLOR: 0x0a1226,
    // Opacity of the dark layer once faded in.
    ALPHA: 0.35,
    // Draws over the placed objects band (up to 9) and the seated avatar (20),
    // and under the interaction markers and the UI (100).
    DEPTH: 50,
    FADE_DURATION_MS: 250,
    HIDDEN_ALPHA: 0,
} as const;
