import type { LayerName } from "@standin/contracts";
import type { EditorBrush } from "@/features/maps/__shared__/types/editor-brush";

// The tile found under the eyedropper and the layer it was on.
export type PickedTile = {
    brush: EditorBrush;
    layer: LayerName;
};
