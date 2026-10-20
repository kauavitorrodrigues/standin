import { AVATAR_SHEET_PX } from "@standin/contracts";
import type { AvatarLayer } from "@standin/contracts";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";
import { assembleSheetIncremental } from "./sheetAssembly";

// The assembled sheet of the layers as a canvas the preview can crop frames
// from. Null when there is no layer, which is an empty avatar.
export const buildSheetCanvas = (
    layers: readonly AvatarLayer[]
): HTMLCanvasElement | null => {
    if (layers.length === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SHEET_PX.w;
    canvas.height = AVATAR_SHEET_PX.h;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(AVATAR_EDITOR_MESSAGES.CANVAS_UNAVAILABLE);

    const pixels = new Uint8ClampedArray(assembleSheetIncremental(layers));
    context.putImageData(
        new ImageData(pixels, AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h),
        0,
        0
    );
    return canvas;
};
