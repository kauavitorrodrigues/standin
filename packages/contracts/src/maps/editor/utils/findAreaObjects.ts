import type { PlacedAsset } from "../../render/render-payload.schema";
import type { EditorModel } from "../types/editor-model";
import type { StampRect } from "../types/stamp-rect";

const isInside = (rect: StampRect, x: number, y: number): boolean =>
    x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;

/**
 * The objects that belong to an area: the ones whose whole footprint sits
 * inside the rectangle and that do not sit on another object (a surface item
 * goes with its parent).
 */
export const findAreaObjects = (
    model: EditorModel,
    rect: StampRect
): PlacedAsset[] => {
    const assets = new Map(model.library.assets.map((a) => [a.id, a]));

    return model.placed.filter((object) => {
        if (object.parentId !== null) return false;
        const asset = assets.get(object.assetId);
        if (!asset) return false;

        const { w, h } = asset.footprint;
        return (
            isInside(rect, object.tileX, object.tileY - h + 1) &&
            isInside(rect, object.tileX + w - 1, object.tileY)
        );
    });
};
