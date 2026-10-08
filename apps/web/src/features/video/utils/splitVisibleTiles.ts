import type { StageTile } from "../types/stage";

type SplitTiles = {
    visible: StageTile[];
    hiddenCount: number;
};

// The strip has room for a handful of tiles. Everything past that is only
// counted (the "+N" button) and shown in the full grid on demand. Order is
// kept, so screens, which come first, are the last thing to be hidden.
export const splitVisibleTiles = (
    tiles: readonly StageTile[],
    max: number
): SplitTiles => ({
    visible: tiles.slice(0, max),
    hiddenCount: Math.max(0, tiles.length - max),
});
