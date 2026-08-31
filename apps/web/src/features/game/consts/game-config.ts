export const GAME_RENDER_CONFIG = {
    PIXEL_ART: true,
    BACKGROUND_COLOR: "#000000",
    REMOVE_CANVAS_ON_DESTROY: true,
    DISABLE_CONTEXT_MENU: true,
} as const;

export const GAME_PHYSICS_CONFIG = {
    SYSTEM: "arcade",
    DEBUG: false,
} as const;
