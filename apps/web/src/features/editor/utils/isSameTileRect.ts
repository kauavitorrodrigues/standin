import type { TileRect } from "@/features/editor/types/tile-rect";

export const isSameTileRect = (a: TileRect, b: TileRect): boolean =>
    a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
