// The look of the name tag over an avatar. Sizes are in world px, since the
// tag scales with the camera like the avatar does.
export const NAME_TAG = {
    HEIGHT: 14,
    PADDING_X: 5,
    RADIUS: 3,
    DOT_RADIUS: 2,
    DOT_GAP: 4,
    FONT_SIZE: "9px",
    FONT_FAMILY: "system-ui, sans-serif",
    TEXT_COLOR: "#ffffff",
    BACKGROUND_COLOR: 0x111827,
    BACKGROUND_ALPHA: 0.85,
    DOT_COLOR: 0x22c55e,
    // The game draws pixel art with nearest filtering, which breaks the edges
    // of text, so the text asks for a high resolution and smooth scaling.
    TEXT_RESOLUTION: 4,
    MAX_CHARACTERS: 20,
    ELLIPSIS: "...",
} as const;
