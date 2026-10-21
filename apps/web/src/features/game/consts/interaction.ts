// The prompt sits over the name tag, which sits over the head of the avatar.
// The space between the prompt and the tag, in world px.
export const INTERACTION_PROMPT_GAP_PX = 4;

export const INTERACTION_PROMPT_STYLE = {
    FONT_SIZE: "16px",
    FONT_FAMILY: "system-ui, sans-serif",
    COLOR: "#ffffff",
    BACKGROUND_COLOR: "#00000099",
    PADDING_X: 12,
    PADDING_Y: 8,
    DEPTH: 100,
    ORIGIN_X: 0.5,
    ORIGIN_Y_BOTTOM: 1,
    INITIAL_POSITION: 0,
} as const;

export const INTERACTION_PROMPT_LABELS = {
    SIT: "Pressione E para sentar",
    TELEPORT: "Pressione E para teleportar",
} as const;
