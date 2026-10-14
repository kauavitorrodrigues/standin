import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { pickTileAt } from "@/features/editor/utils/pickTileAt";

// The eyedropper (I). A click makes the tile under the pointer the brush, and
// the tab follows. An empty cell changes nothing. It never touches the draft.
export const createPickerController = (env: ToolEnv): ToolController => ({
    onPointerDown: ({ cell, model }) => {
        pickTileAt(env.store, model, cell);
    },
});
