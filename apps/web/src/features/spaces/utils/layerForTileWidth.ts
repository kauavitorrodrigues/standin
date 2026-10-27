import {
    MEDIA_LAYER_HIGH_FROM_PX,
    MEDIA_LAYER_MID_FROM_PX,
} from "@/features/spaces/consts/mediaLayer";
import type { MediaViewLayer } from "@/features/game/multiplayer/types/mediaView";

/**
 * The camera layer a tile needs, from its width in CSS pixels and the device
 * pixel ratio of the screen.
 */
export const layerForTileWidth = (
    cssWidth: number,
    pixelRatio: number
): MediaViewLayer => {
    const realWidth = cssWidth * pixelRatio;
    if (realWidth >= MEDIA_LAYER_HIGH_FROM_PX) return "high";
    if (realWidth >= MEDIA_LAYER_MID_FROM_PX) return "mid";
    return "low";
};
