import { TILE_SIZE } from "@standin/contracts";
import type { Crop, Footprint } from "../types/spriteGeometry";

// The footprint, counted in tiles, fits inside the rectangle.
export const footprintFitsCrop = (crop: Crop, footprint: Footprint) =>
    footprint.offsetX + footprint.w <= crop.w / TILE_SIZE &&
    footprint.h <= crop.h / TILE_SIZE;
