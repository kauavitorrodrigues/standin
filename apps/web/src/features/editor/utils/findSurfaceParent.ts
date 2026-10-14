import {
    footprintCells,
    SURFACE_TYPES,
    type Cell,
    type EditorModel,
    type PlacedAsset,
} from "@standin/contracts";

// The object whose top covers the cell, when it accepts items on top.
export const findSurfaceParent = (
    model: EditorModel,
    cell: Cell
): PlacedAsset | null => {
    const assets = new Map(model.library.assets.map((a) => [a.id, a]));

    const parent = model.placed.find((placed) => {
        const asset = assets.get(placed.assetId);
        if (!asset) return false;
        if (!(SURFACE_TYPES as readonly string[]).includes(asset.type)) {
            return false;
        }
        return footprintCells(asset, placed.tileX, placed.tileY).some(
            ({ x, y }) => x === cell[0] && y === cell[1]
        );
    });

    return parent ?? null;
};
