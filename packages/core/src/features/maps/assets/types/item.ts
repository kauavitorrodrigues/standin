import type { AssetDef } from "./asset-def";

// A placed object with the definition of its asset. `rowId` is the id of the
// `map_assets` row, `assetId` the definition it points at.
export type Item = AssetDef & {
    rowId: string;
    assetId: string;
    tileX: number;
    tileY: number;
    parentId: string | null;
};
