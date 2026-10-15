import type { EditorOpHandlers } from "../../types/editor-op-handler";
import { applyEditorErase } from "./applyEditorErase";
import { applyEditorMoveAsset } from "./applyEditorMoveAsset";
import { applyEditorPaint } from "./applyEditorPaint";
import { applyEditorPlaceAsset } from "./applyEditorPlaceAsset";
import { applyEditorRemoveAsset } from "./applyEditorRemoveAsset";
import { applyEditorRemoveZone } from "./applyEditorRemoveZone";
import { applyEditorReplaceAsset } from "./applyEditorReplaceAsset";
import { applyEditorSetBackground } from "./applyEditorSetBackground";
import { applyEditorSetZone } from "./applyEditorSetZone";

/**
 * Operation type to implementation. The object operations (place_asset,
 * move_asset, replace_asset, remove_asset) are added here, one line each.
 */
export const EDITOR_OP_HANDLERS: EditorOpHandlers = {
    paint: applyEditorPaint,
    erase: applyEditorErase,
    set_background: applyEditorSetBackground,
    set_zone: applyEditorSetZone,
    remove_zone: applyEditorRemoveZone,
    place_asset: applyEditorPlaceAsset,
    move_asset: applyEditorMoveAsset,
    remove_asset: applyEditorRemoveAsset,
    replace_asset: applyEditorReplaceAsset,
};
