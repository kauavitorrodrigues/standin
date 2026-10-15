// Placed objects draw above the tile layers and below the object markers and
// the avatars. Inside that band the depth follows the bottom of the sprite,
// so objects lower on the map draw over the ones behind them.
export const PLACED_ASSET_DEPTH = {
    MIN: 1,
    MAX: 9,
    // An item on a desk always draws just above its parent.
    CHILD_STEP: 0.001,
} as const;
