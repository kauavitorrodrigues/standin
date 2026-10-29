import type { EditorModel } from "../types/editor-model";
import { getOccupiedCells } from "./getOccupiedCells";

/** Every cell a placed object covers, as "column,row" keys. */
export const getOccupiedKeys = (
    model: Pick<EditorModel, "placed" | "library">
): Set<string> => {
    const assets = new Map(model.library.assets.map((a) => [a.id, a]));
    const keys = new Set<string>();

    for (const placed of model.placed) {
        const asset = assets.get(placed.assetId);
        if (!asset) continue;

        getOccupiedCells({
            tileX: placed.tileX,
            tileY: placed.tileY,
            width: asset.footprint.w,
            height: asset.footprint.h,
            mask: asset.footprint.mask ?? null,
        }).forEach(({ x, y }) => keys.add(`${x},${y}`));
    }

    return keys;
};
