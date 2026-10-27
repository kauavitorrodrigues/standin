import type { StageTile } from "@/features/spaces/types/stage";
import type { MediaView } from "@/features/game/multiplayer/types/mediaView";
import { layerForTileWidth } from "@/features/spaces/utils/layerForTileWidth";

/**
 * The views the server must send above the low layer. With a tile featured,
 * only that one counts, at the width of the main area. In the plain grid
 * every tile has the grid tile width. A person without video, a screen and
 * the local camera never count, and neither does a tile that is small enough
 * for the low layer.
 */
export const tileMediaViews = (
    tiles: readonly StageTile[],
    featured: StageTile | undefined,
    tileWidth: number,
    pixelRatio: number,
    maxViews: number
): MediaView[] => {
    const layer = layerForTileWidth(tileWidth, pixelRatio);
    if (layer === "low") return [];

    const candidates = featured ? [featured] : tiles;
    const views: MediaView[] = [];
    for (const tile of candidates) {
        if (tile.slot !== "camera" || tile.isSelf) continue;
        if (tile.stream === null || tile.userId === null) continue;
        views.push({ userId: tile.userId, layer });
    }
    return views.slice(0, maxViews);
};
