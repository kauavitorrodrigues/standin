import type { MapLayout } from "../../schemas/layout.schema";

export const isCellInside = (
    layout: MapLayout,
    [x, y]: [number, number]
): boolean => x >= 0 && y >= 0 && x < layout.width && y < layout.height;
