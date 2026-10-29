import { getOccupiedCells } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";

// Every cell a placed object covers, as "column,row" keys.
export const getOccupiedKeys = (model: EditorModel): Set<string> => {
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
