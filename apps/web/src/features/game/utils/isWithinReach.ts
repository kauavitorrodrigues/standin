import type { PlacedRect } from "@/features/game/utils/placed";

type Point = { x: number; y: number };

// Whether a circle at the point is within `reach` px of the rectangle, as the
// center sitting inside the rectangle grown by that much on every side.
export const isWithinReach = (
    rect: PlacedRect,
    point: Point,
    reach: number
): boolean =>
    point.x >= rect.x - reach &&
    point.x <= rect.x + rect.width + reach &&
    point.y >= rect.y - reach &&
    point.y <= rect.y + rect.height + reach;
