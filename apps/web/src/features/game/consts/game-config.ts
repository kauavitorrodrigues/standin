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

// What the WebGL context is asked for, written down so it does not change by
// accident with a Phaser update. Phaser always asks for a depth and a stencil
// buffer. `antialiasGL` is off: the art is made of pixels and is drawn with
// nearest neighbor, so smoothing the edges of the canvas would only blur it.
// The canvas is kept opaque and is never preserved, since the game draws it
// again for every frame it shows.
export const GAME_CONTEXT_CONFIG = {
    transparent: false,
    antialiasGL: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "default",
} as const;

// The attributes of the context the browser gave back, for the ones above.
export const GAME_CONTEXT_EXPECTED = {
    alpha: false,
    antialias: false,
    depth: true,
    stencil: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "default",
} as const;
