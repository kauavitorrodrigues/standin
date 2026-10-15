import type { Crop, Footprint } from "../types/spriteGeometry";

export const NO_CROP: Crop = { x: 0, y: 0, w: 0, h: 0 };

// The footprint before it is marked. It is the editor that tells it apart: a
// footprint needs at least one tile on each side.
export const NO_FOOTPRINT: Footprint = { w: 0, h: 0, offsetX: 0 };

// Where a variation starts when the footprint is not copied from another one.
export const DEFAULT_FOOTPRINT: Footprint = { w: 1, h: 1, offsetX: 0 };
