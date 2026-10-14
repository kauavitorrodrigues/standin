import type { AssetDefinition, Cell, PlacedAsset } from "@standin/contracts";

const clamp = (value: number, min: number, max: number): number => {
    // An item bigger than the top has no spot that fits: keep the cell and
    // let the placement rule say why.
    if (min > max) return value;
    return Math.min(max, Math.max(min, value));
};

// Moves the anchor of an item so its footprint stays inside the top of the
// parent, as close to the cursor cell as it can. The anchor is the bottom left
// cell of the footprint.
export const snapToSurface = (
    cell: Cell,
    item: AssetDefinition,
    parent: PlacedAsset,
    parentAsset: AssetDefinition
): Cell => {
    const top = parent.tileY - parentAsset.footprint.h + 1;
    const x = clamp(
        cell[0],
        parent.tileX,
        parent.tileX + parentAsset.footprint.w - item.footprint.w
    );
    const y = clamp(cell[1], top + item.footprint.h - 1, parent.tileY);
    return [x, y];
};
