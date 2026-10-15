import type { PixelData } from "@/features/assets/utils/detectSolidMask";
import type { WallSheet } from "./buildWallSheet";

// The pixels of a PNG, read through a canvas.
export const readPixels = async (file: File): Promise<PixelData> => {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");
    context.drawImage(bitmap, 0, 0);
    bitmap.close();

    return context.getImageData(0, 0, canvas.width, canvas.height);
};

// The sheet as a PNG file, ready to go up as the image of a tileset.
export const encodeSheet = async (
    sheet: WallSheet,
    name: string
): Promise<File> => {
    const canvas = document.createElement("canvas");
    canvas.width = sheet.width;
    canvas.height = sheet.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");
    context.putImageData(
        new ImageData(
            new Uint8ClampedArray(sheet.data),
            sheet.width,
            sheet.height
        ),
        0,
        0
    );
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
    );
    if (!blob) throw new Error("The sheet could not be encoded.");

    return new File([blob], `${name}.png`, { type: "image/png" });
};
