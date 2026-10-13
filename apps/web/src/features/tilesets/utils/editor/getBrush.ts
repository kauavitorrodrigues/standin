import type { TileMeta } from "@standin/contracts";
import type { TileBrush } from "../../types/sheet";

// The brush the picker takes from a tile: its category, or nothing when it has
// none.
export const getTileBrush = (meta: TileMeta, index: number): TileBrush | null =>
    meta[String(index)]?.category ?? null;
