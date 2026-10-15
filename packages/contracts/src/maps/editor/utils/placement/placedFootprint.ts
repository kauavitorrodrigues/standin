import type { AssetDefinition } from "../../../../assets/types";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import type { Footprint } from "../../types/footprint";

export const placedFootprint = (
    placed: PlacedAsset,
    asset: AssetDefinition
): Footprint => ({
    tileX: placed.tileX,
    tileY: placed.tileY,
    width: asset.footprint.w,
    height: asset.footprint.h,
    mask: asset.footprint.mask ?? null,
});
