import type { AssetDefinition } from "@standin/contracts";
import type { Item } from "../types/item";

/**
 * The slice of an asset definition (keyed by the row id, see `toPlacementModel`) the pure placement rules read (id, type,
 * placement and footprint). The rest of the palette fields are never looked at
 * by those rules, so the cast stands for "a definition as far as placement goes".
 */
export const toPlacementAsset = (item: Item): AssetDefinition =>
    ({
        id: item.rowId,
        type: item.type,
        placement: item.placement,
        footprint: { w: item.footprintW, h: item.footprintH, offsetX: 0 },
    }) as AssetDefinition;
