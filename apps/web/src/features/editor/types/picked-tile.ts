import type { LayerName } from "@standin/contracts";
import type { EditorBrush } from "@/features/editor/types/editor-brush";

// The tile found under the eyedropper and the layer it was on.
export type PickedTile = {
    brush: EditorBrush;
    layer: LayerName;
};
