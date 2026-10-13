import type { Crop } from "../types/spriteGeometry";
import { hasCrop } from "./spriteGeometry";

// The part of the PNG inside the crop, as a PNG of its own. The API takes one
// whole image per asset, so the crop is applied here before the upload. With
// no crop the file goes up as it is.
export const cropImageFile = async (file: File, crop: Crop): Promise<File> => {
    if (!hasCrop(crop)) return file;

    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(crop.w, crop.h);
    const context = canvas.getContext("2d");
    if (!context) {
        bitmap.close();
        return file;
    }
    context.drawImage(
        bitmap,
        crop.x,
        crop.y,
        crop.w,
        crop.h,
        0,
        0,
        crop.w,
        crop.h
    );
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: "image/png" });
    return new File([blob], file.name, { type: "image/png" });
};
