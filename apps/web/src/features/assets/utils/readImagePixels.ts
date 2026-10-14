import type { PixelData } from "./detectSolidMask";

// The pixels of a local image, read by drawing it on a canvas the user never
// sees. Null when the browser gives no canvas to draw on.
export const readImagePixels = async (
    file: File
): Promise<PixelData | null> => {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
        bitmap.close();
        return null;
    }
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height);
    bitmap.close();
    return pixels;
};
