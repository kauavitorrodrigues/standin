import { COLOR_SAMPLE_MAX_PX } from "../consts/colorNames";
import type { Crop } from "../types/spriteGeometry";
import { getDominantColor } from "./getDominantColor";
import { hasCrop } from "./spriteGeometry";

// The predominant color of the piece: the crop when there is one, the whole
// image otherwise. It reads a scaled-down copy, which is enough for a tone.
export const readDominantColor = async (
    file: File,
    crop: Crop
): Promise<string | null> => {
    const bitmap = await createImageBitmap(file);
    const source = hasCrop(crop)
        ? crop
        : { x: 0, y: 0, w: bitmap.width, h: bitmap.height };
    const scale = Math.min(
        COLOR_SAMPLE_MAX_PX / Math.max(source.w, source.h),
        1
    );
    const width = Math.max(Math.round(source.w * scale), 1);
    const height = Math.max(Math.round(source.h * scale), 1);

    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
        bitmap.close();
        return null;
    }
    context.drawImage(
        bitmap,
        source.x,
        source.y,
        source.w,
        source.h,
        0,
        0,
        width,
        height
    );
    bitmap.close();

    return getDominantColor(context.getImageData(0, 0, width, height).data);
};
