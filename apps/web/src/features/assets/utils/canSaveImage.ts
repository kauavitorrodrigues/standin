import type { Crop, Footprint } from "../types/spriteGeometry";
import { hasCrop, hasFootprint, splitsIntoFrames } from "./spriteGeometry";

// Whether what the editor marked can be saved: a crop that splits into frames
// of whole tiles, with a footprint on it.
export const canSaveImage = (
    crop: Crop,
    footprint: Footprint,
    frameCount: number
) =>
    hasCrop(crop) &&
    hasFootprint(footprint) &&
    splitsIntoFrames(crop, frameCount);
