import {
    cellsInside,
    occupiedCells,
    type AssetDefinition,
    type Cell,
    type PlacedAsset,
} from "@standin/contracts";

// The anchor, nearest to the cell, where every cell of the item sits on a cell
// the parent occupies. Null when the item fits nowhere on the top. It only
// matters for a parent with a footprint mask, because without one the top is
// the whole rectangle.
export const findNearestSurfaceCell = (
    cell: Cell,
    item: AssetDefinition,
    parent: PlacedAsset,
    parentAsset: AssetDefinition
): Cell | null => {
    const surface = occupiedCells(parentAsset, parent.tileX, parent.tileY);
    const top = parent.tileY - parentAsset.footprint.h + 1;
    let best: Cell | null = null;
    let bestDistance = Infinity;

    for (
        let x = parent.tileX;
        x <= parent.tileX + parentAsset.footprint.w - item.footprint.w;
        x++
    ) {
        for (let y = top + item.footprint.h - 1; y <= parent.tileY; y++) {
            if (!cellsInside(occupiedCells(item, x, y), surface)) continue;

            const distance = (x - cell[0]) ** 2 + (y - cell[1]) ** 2;
            if (distance >= bestDistance) continue;
            best = [x, y];
            bestDistance = distance;
        }
    }

    return best;
};
