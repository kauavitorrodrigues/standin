import { EDITOR_MODES, type EditorMode } from "../consts/editorModes";

type Params = {
    chosenMode: EditorMode;
    hasCrop: boolean;
    footprintOnly: boolean;
};

// There is nothing to put a footprint on until the crop is marked, unless the
// crop is already the whole image.
export const getEditorMode = ({
    chosenMode,
    hasCrop,
    footprintOnly,
}: Params): EditorMode => {
    if (footprintOnly) return EDITOR_MODES.FOOTPRINT;
    return hasCrop ? chosenMode : EDITOR_MODES.CROP;
};
