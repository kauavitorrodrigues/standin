import type { Cell, EditorModel, EditorOp } from "@standin/contracts";

// One move_asset for each selected object that exists in the model, shifted
// by the delta. The operation moves the children along, so an id whose parent
// is also in the list is left out, or the child would move twice.
export const buildMoveOps = (
    model: Readonly<EditorModel>,
    ids: readonly string[],
    delta: Cell
): EditorOp[] => {
    const chosen = new Set(ids);

    return model.placed
        .filter(
            (placed) =>
                chosen.has(placed.id) &&
                !(placed.parentId !== null && chosen.has(placed.parentId))
        )
        .map((placed) => ({
            type: "move_asset",
            id: placed.id,
            tileX: placed.tileX + delta[0],
            tileY: placed.tileY + delta[1],
        }));
};
