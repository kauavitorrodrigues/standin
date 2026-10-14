import type { Footprint } from "../types/footprint";

export const isFootprintInside = (
    inner: Footprint,
    outer: Footprint
): boolean =>
    inner.tileX >= outer.tileX &&
    inner.tileX + inner.width <= outer.tileX + outer.width &&
    inner.tileY <= outer.tileY &&
    inner.tileY - inner.height >= outer.tileY - outer.height;
