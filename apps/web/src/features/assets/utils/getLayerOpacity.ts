import { LAYER_DIMMED_OPACITY } from "../consts/editorOverlayStyle";
import type { EditorMode } from "../consts/editorModes";

// How a layer is drawn: full when it is the one being edited, dimmed when it
// is only shown for reference.
export const getLayerOpacity = (
    layer: EditorMode,
    mode: EditorMode
): number => {
    if (layer === mode) return 1;
    return LAYER_DIMMED_OPACITY;
};
