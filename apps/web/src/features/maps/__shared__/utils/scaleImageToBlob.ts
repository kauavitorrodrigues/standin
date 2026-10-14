import { THUMBNAIL_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { canvasToBlob } from "@/features/maps/__shared__/utils/canvasToBlob";
import type { ThumbnailSize } from "@/features/maps/__shared__/types/thumbnail";

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
