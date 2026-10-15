import { type Footprint } from "@standin/contracts";
import type { AssetDef } from "../types/asset-def";
import type { Position } from "../types/position";

export const toFootprint = (
    position: Position,
    def: Pick<AssetDef, "footprintW" | "footprintH" | "footprintMask">
): Footprint => ({
    tileX: position.tileX,
    tileY: position.tileY,
    width: def.footprintW,
    height: def.footprintH,
    mask: def.footprintMask ?? null,
});
