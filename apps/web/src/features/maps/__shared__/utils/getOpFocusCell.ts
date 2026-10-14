import type { Cell, EditorOp, PlacedAsset } from "@standin/contracts";

// The cell a camera should go to for an operation, or null when the operation
// has no place (the background). An operation on an object already in the map
// is found by the id, in `placed`.
export const getOpFocusCell = (
    op: EditorOp | undefined,
    placed: readonly PlacedAsset[]
): Cell | null => {
    if (!op) return null;

    switch (op.type) {
        case "paint":
        case "erase":
            return op.cells[0] ?? null;
        case "paint_tiles":
            return op.tiles[0]?.cells[0] ?? null;
        case "place_asset":
        case "move_asset":
            return [op.tileX, op.tileY];
        case "replace_asset":
        case "remove_asset": {
            const target = placed.find(({ id }) => id === op.id);
            return target ? [target.tileX, target.tileY] : null;
        }
        case "set_zone":
            return [op.zone.rect.x, op.zone.rect.y];
        case "remove_zone":
        case "set_background":
            return null;
    }
};
