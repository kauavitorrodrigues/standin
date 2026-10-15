import {
    ASSET_TYPES,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import type { HoverTarget } from "@/features/game/types/hover";
import { resolvePlacedLayout } from "@/features/game/utils/placed";

type PlacedRef = Pick<
    PlacedAsset,
    "id" | "assetId" | "tileX" | "tileY" | "offsetX" | "offsetY" | "parentId"
>;
type AssetRef = Pick<
    AssetDefinition,
    | "id"
    | "type"
    | "footprint"
    | "placement"
    | "surfaceHeightPx"
    | "solid"
    | "sprite"
>;

/**
 * The placed desks as hover targets, with the rectangle their sprite covers. Only assets of the DESK type can be claimed.
 */
export const buildDeskAreas = (
    placed: readonly PlacedRef[],
    assetsById: ReadonlyMap<string, AssetRef>,
    mapHeightPx: number
): HoverTarget[] => {
    const placedById = new Map(placed.map((item) => [item.id, item]));
    const areas: HoverTarget[] = [];

    for (const item of placed) {
        const asset = assetsById.get(item.assetId);
        if (!asset || asset.type !== ASSET_TYPES.DESK) continue;

        const layout = resolvePlacedLayout(
            item,
            assetsById,
            placedById,
            mapHeightPx
        );
        if (!layout) continue;

        areas.push({
            id: item.id,
            bounds: {
                x: layout.x,
                y: layout.bottomY - asset.sprite.h,
                width: asset.sprite.w,
                height: asset.sprite.h,
            },
        });
    }

    return areas;
};
