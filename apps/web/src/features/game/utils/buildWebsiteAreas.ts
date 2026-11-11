import {
    OBJECT_BEHAVIORS,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import type { HoverTarget } from "@/features/game/types/hover";
import { resolvePlacedLayout } from "@/features/game/utils/placed";

type PlacedRef = Pick<
    PlacedAsset,
    | "id"
    | "assetId"
    | "tileX"
    | "tileY"
    | "offsetX"
    | "offsetY"
    | "parentId"
    | "behaviorParams"
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
    | "behavior"
>;

/**
 * The placed objects that embed a website as hover targets, with the rectangle
 * their sprite covers. An object whose params were never set has nothing to
 * show, so it is not a target.
 */
export const buildWebsiteAreas = (
    placed: readonly PlacedRef[],
    assetsById: ReadonlyMap<string, AssetRef>,
    mapHeightPx: number
): HoverTarget[] => {
    const placedById = new Map(placed.map((item) => [item.id, item]));
    const areas: HoverTarget[] = [];

    for (const item of placed) {
        if (item.behaviorParams === null) continue;

        const asset = assetsById.get(item.assetId);
        if (asset?.behavior !== OBJECT_BEHAVIORS.EMBEDDED_WEBSITE) continue;

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
