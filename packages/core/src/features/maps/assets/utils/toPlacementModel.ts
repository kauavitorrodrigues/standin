import type { EditorModel, MapLayout } from "@standin/contracts";
import type { Item } from "../types/item";
import type { MapInfo } from "../types/map-info";
import { toPlacementAsset } from "./toPlacementAsset";

/**
 * Adapts database rows to the model the pure placement rules of the contracts
 * read. The library has no tilesets on purpose: the live routes do not look at
 * tile meta, so a solid wall under a GROUND object does not refuse it here.
 * The object limit is not read either. Each row gets a definition of its own, keyed by
 * the row id, so rows of the same asset never share one. Without a map (the SURFACE rule only
 * looks at objects), the size is zero and the layout empty, and no rule that
 * reads them is called.
 */
export const toPlacementModel = (items: Item[], map?: MapInfo): EditorModel => {
    return {
        mapId: map?.id ?? "",
        width: map?.width ?? 0,
        height: map?.height ?? 0,
        layout: map?.layout ?? ({} as MapLayout),
        placed: items.map((item) => ({
            id: item.rowId,
            assetId: item.rowId,
            tileX: item.tileX,
            tileY: item.tileY,
            offsetX: item.offsetX,
            offsetY: item.offsetY,
            parentId: item.parentId,
            propertyOverrides: null,
        })),
        library: {
            tilesets: [],
            assets: items.map(toPlacementAsset),
            categories: [],
            areas: [],
        },
        desks: [],
        limits: { objectsUsed: items.length, objectsMax: items.length },
        version: 0,
    };
};
