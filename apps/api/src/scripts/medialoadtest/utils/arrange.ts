import { DENSE_AREA_PX, SPREAD_AREA_PX, WALK_STEP_PX } from "../consts";

export type Layout = "dense" | "spread";
export type Point = { x: number; y: number };

const areaOf = (layout: Layout): number =>
    layout === "dense" ? DENSE_AREA_PX : SPREAD_AREA_PX;

/** A random spot in the area of the layout. Dense puts everybody in earshot. */
export const randomSpot = (layout: Layout, rng: () => number): Point => {
    const area = areaOf(layout);
    return { x: rng() * area, y: rng() * area };
};

/** One step in a random direction, kept inside the area. */
export const walk = (from: Point, layout: Layout, rng: () => number): Point => {
    const area = areaOf(layout);
    const angle = rng() * Math.PI * 2;
    const clamp = (value: number) => Math.min(area, Math.max(0, value));
    return {
        x: clamp(from.x + Math.cos(angle) * WALK_STEP_PX),
        y: clamp(from.y + Math.sin(angle) * WALK_STEP_PX),
    };
};
