import { resolveGid, toLayoutLibrary } from "@standin/contracts";
import type { Cell, EditorModel } from "@standin/contracts";
import { PICK_LAYER_ORDER } from "@/features/maps/__shared__/consts/layers";
import type { PickedTile } from "@/features/maps/__shared__/types/picked-tile";
import { getBrushLayer } from "@/features/maps/__shared__/utils/getBrushLayer";
import { getCellGid } from "@/features/maps/__shared__/utils/getCellGid";

// The tile on a cell, looking at the layers in PICK_LAYER_ORDER. A tile with
// no category (it cannot be painted) is skipped. Null for an empty cell.
export const findPickedTile = (
    model: EditorModel,
    cell: Cell
): PickedTile | null => {
    const library = toLayoutLibrary(model.library, model.usedTilesets);

    for (const layer of PICK_LAYER_ORDER) {
        const gid = getCellGid(model.layout, layer, cell);
        const found = resolveGid(model.layout, library, gid);
        if (!found) continue;
        if (getBrushLayer(model, found) === null) continue;

        return { brush: found, layer };
    }
    return null;
};
