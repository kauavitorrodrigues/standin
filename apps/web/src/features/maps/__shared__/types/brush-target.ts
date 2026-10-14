import type { LayerName } from "@standin/contracts";
import type { EditorBrush } from "@/features/maps/__shared__/types/editor-brush";

// What a painting gesture paints: the tile and the layer its category sends it to.
export type BrushTarget = {
    brush: EditorBrush;
    layer: LayerName;
};
