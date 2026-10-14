import type { ToolController } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import { pickTileAt } from "@/features/maps/__shared__/utils/pickTileAt";

// The eyedropper (I). A click makes the tile under the pointer the brush, and
// the tab follows. An empty cell changes nothing. It never touches the draft.
export const createPickerController = (env: ToolEnv): ToolController => ({
    onPointerDown: ({ cell, model }) => {
        pickTileAt(env.store, model, cell);
    },
});
