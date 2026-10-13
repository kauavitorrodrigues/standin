import type { AssetDef } from "../types/asset-def";
import type { Footprint } from "../types/footprint";
import type { Position } from "../types/position";

export const toFootprint = (
    position: Position,
    def: Pick<AssetDef, "footprintW" | "footprintH">
): Footprint => ({
    tileX: position.tileX,
    tileY: position.tileY,
    width: def.footprintW,
    height: def.footprintH,
});
