import type { FootprintMask } from "@standin/contracts";
import type { assetsTable } from "@standin/database";

type AssetRow = typeof assetsTable.$inferSelect;

// The family is `baseAssetId ?? id`, see `getFamilyId`.
export type AssetDef = {
    id: string;
    baseAssetId: string | null;
    rotation: AssetRow["rotation"];
    colorKey: string | null;
    type: AssetRow["type"];
    placement: AssetRow["placement"];
    footprintW: number;
    footprintH: number;
    // The occupied tiles inside the footprint, null for the whole rectangle.
    footprintMask?: FootprintMask | null;
};
