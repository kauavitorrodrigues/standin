import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";
import { canvasToBlob } from "@/features/editor/utils/canvasToBlob";
import type { ThumbnailSize } from "@/features/editor/types/thumbnail";

// Draws the image at `size` without smoothing (pixel art) and encodes a PNG.
export const scaleImageToBlob = (
    image: CanvasImageSource,
    size: ThumbnailSize
): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext("2d");
    if (!context) {
        return Promise.reject(new Error(THUMBNAIL_MESSAGES.ENCODE_FAILED));
    }

    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, size.width, size.height);
    return canvasToBlob(canvas);
};
