import type { Cell, EditorModel } from "@standin/contracts";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import { findPickedTile } from "@/features/maps/__shared__/utils/findPickedTile";

// The eyedropper: makes the tile under the cell the brush. An empty cell
// changes nothing.
export const pickTileAt = (
    store: Pick<ToolEnv["store"], "pickTile">,
    model: EditorModel,
    cell: Cell
): boolean => {
    const picked = findPickedTile(model, cell);
    if (!picked) return false;

    store.pickTile(picked.brush);
    return true;
};
