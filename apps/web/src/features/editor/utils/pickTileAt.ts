import type { Cell, EditorModel } from "@standin/contracts";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { findPickedTile } from "@/features/editor/utils/findPickedTile";

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
