import type { AssetDefinition } from "../../../assets/types";
import type { PlacedAsset } from "../../render/render-payload.schema";
import type { EditorModel } from "../types/editor-model";
import { canReplaceAsset, type ReplaceAnchor } from "./canReplaceAsset";

// How far the middle of the new footprint is from the middle of the old one,
// squared, in tiles. The footprint grows up from its bottom left cell.
const centerDistance = (
    from: { x: number; y: number; w: number; h: number },
    to: { x: number; y: number; w: number; h: number }
): number => {
    const fromX = from.x + from.w / 2;
    const fromY = from.y - from.h / 2 + 0.5;
    const toX = to.x + to.w / 2;
    const toY = to.y - to.h / 2 + 0.5;
    return (fromX - toX) ** 2 + (fromY - toY) ** 2;
};

/**
 * Where a swapped object can be anchored. Where it stands when the new asset
 * fits there. Otherwise the closest anchor, by the middle of the footprint,
 * that keeps the new footprint over the old one and passes canReplaceAsset: a
 * rotation with another footprint, such as a door that turns from the top wall
 * into a tall one, grows from another cell. Null when nowhere fits.
 */
export const findReplaceAnchor = (
    model: EditorModel,
    placed: PlacedAsset,
    current: AssetDefinition,
    target: AssetDefinition
): ReplaceAnchor | null => {
    if (canReplaceAsset(model, placed, target).ok) {
        return { tileX: placed.tileX, tileY: placed.tileY };
    }

    const before = {
        x: placed.tileX,
        y: placed.tileY,
        w: current.footprint.w,
        h: current.footprint.h,
    };
    const { w, h } = target.footprint;
    const candidates: { anchor: ReplaceAnchor; distance: number }[] = [];

    for (let x = before.x - w + 1; x < before.x + before.w; x += 1) {
        for (let y = before.y - before.h + 1; y < before.y + h; y += 1) {
            candidates.push({
                anchor: { tileX: x, tileY: y },
                distance: centerDistance(before, { x, y, w, h }),
            });
        }
    }
    candidates.sort((a, b) => a.distance - b.distance);

    const found = candidates.find(
        ({ anchor }) => canReplaceAsset(model, placed, target, anchor).ok
    );
    return found?.anchor ?? null;
};
