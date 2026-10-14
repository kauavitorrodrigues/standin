import { TILE_SIZE } from "@standin/contracts";
import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";
import { canvasToBlob } from "@/features/editor/utils/canvasToBlob";
import type { TileRect } from "@/features/editor/types/tile-rect";

// Cuts the region `rect` (in tiles) out of the image and encodes a PNG at its
// native size (`w * 32` by `h * 32`), without smoothing.
export const cropImageToBlob = (
    image: CanvasImageSource,
    rect: TileRect
): Promise<Blob> => {
    const width = rect.w * TILE_SIZE;
    const height = rect.h * TILE_SIZE;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        return Promise.reject(new Error(THUMBNAIL_MESSAGES.ENCODE_FAILED));
    }

    context.imageSmoothingEnabled = false;
    context.drawImage(
        image,
        rect.x * TILE_SIZE,
        rect.y * TILE_SIZE,
        width,
        height,
        0,
        0,
        width,
        height
    );
    return canvasToBlob(canvas);
};
