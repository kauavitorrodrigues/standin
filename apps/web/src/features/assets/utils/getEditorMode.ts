import { EDITOR_MODES, type EditorMode } from "../consts/editorModes";

type Params = {
    chosenMode: EditorMode;
    hasCrop: boolean;
    footprintOnly: boolean;
    // The collision painter can be used, which depends on the asset.
    canCollide: boolean;
};

// The mode to use when the one chosen is not available.
const getFallbackMode = (hasCrop: boolean, footprintOnly: boolean) => {
    if (footprintOnly || hasCrop) return EDITOR_MODES.FOOTPRINT;
    return EDITOR_MODES.CROP;
};

// There is nothing to put a footprint on until the crop is marked, unless the
// crop is already the whole image. The collision painter falls back to the
// footprint when the asset stops allowing it, like when it stops blocking.
export const getEditorMode = ({
    chosenMode,
    hasCrop,
    footprintOnly,
    canCollide,
}: Params): EditorMode => {
    if (chosenMode === EDITOR_MODES.COLLISION && !canCollide) {
        return getFallbackMode(hasCrop, footprintOnly);
    }
    if (footprintOnly && chosenMode === EDITOR_MODES.CROP) {
        return EDITOR_MODES.FOOTPRINT;
    }
    if (footprintOnly) return chosenMode;
    return hasCrop ? chosenMode : EDITOR_MODES.CROP;
};
