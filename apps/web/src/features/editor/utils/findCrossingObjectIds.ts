import {
    footprintCells,
    type EditorModel,
    type PlacedAsset,
} from "@standin/contracts";
import type { TileRect } from "@/features/editor/types/tile-rect";

const isInside = (rect: TileRect, x: number, y: number): boolean =>
    x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;

// The objects whose footprint is partly inside the frame and partly outside:
// the ones captureStamp refuses with STAMP_OBJECT_CROSSES_EDGE. An object
// wholly inside or wholly outside is not one of them.
export const findCrossingObjectIds = (
    model: Readonly<EditorModel>,
    rect: TileRect
): PlacedAsset["id"][] => {
    const assets = new Map(model.library.assets.map((item) => [item.id, item]));
    const ids: PlacedAsset["id"][] = [];

    for (const placed of model.placed) {
        const asset = assets.get(placed.assetId);
        if (!asset) continue;

        const cells = footprintCells(asset, placed.tileX, placed.tileY);
        const inside = cells.filter(({ x, y }) => isInside(rect, x, y));
        if (inside.length > 0 && inside.length < cells.length) {
            ids.push(placed.id);
        }
    }

    return ids;
};
