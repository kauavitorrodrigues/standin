import type { Footprint } from "../types/footprint";

export const footprintsOverlap = (a: Footprint, b: Footprint): boolean =>
    a.tileX < b.tileX + b.width &&
    b.tileX < a.tileX + a.width &&
    a.tileY - a.height < b.tileY &&
    b.tileY - b.height < a.tileY;
