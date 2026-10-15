// Placed objects draw above the tile layers and below the object markers and
// the avatars. Inside that band the depth follows the bottom of the sprite,
// so objects lower on the map draw over the ones behind them.
export const PLACED_ASSET_DEPTH = {
    MIN: 1,
    MAX: 9,
    // Flat pieces such as rugs draw over the tile layers and under every
    // object and avatar. They keep the order of their bases among themselves,
    // squeezed into this band. FLOOR_MAX stays under MAP_OBJECT_MARKER_DEPTH
    // (0.9), so the sit and teleport markers stay visible over a rug.
    FLOOR_MIN: 0.1,
    FLOOR_MAX: 0.8,
    // An item on a desk always draws just above its parent.
    CHILD_STEP: 0.001,
    // A slice of an object drawn by rows sits just under an object whose base
    // is on the same row, so a chair in the free part of a desk draws over it.
    SLICE_STEP: 0.0005,
    // An avatar standing on the same line as the base of an object draws just
    // over it.
    AVATAR_STEP: 0.002,
    // An avatar that sits draws over everything, since it is in the seat and
    // the piece it sits on must not cover it.
    SEATED_AVATAR: 20,
} as const;
