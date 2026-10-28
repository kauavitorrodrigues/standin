import { AVATAR_SHEET_PX } from "@standin/contracts";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";

// Downloads a PNG sheet and returns its RGBA. The browser decodes it, which
// matches the server for sheets with only opaque or transparent pixels.
export const decodeSheet = async (url: string): Promise<Uint8Array> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(AVATAR_EDITOR_MESSAGES.SHEET_LOAD_FAILED);

    const bitmap = await createImageBitmap(await response.blob(), {
        premultiplyAlpha: "none",
        colorSpaceConversion: "none",
    });

    try {
        if (
            bitmap.width !== AVATAR_SHEET_PX.w ||
            bitmap.height !== AVATAR_SHEET_PX.h
        ) {
            throw new Error(AVATAR_EDITOR_MESSAGES.SHEET_INVALID_SIZE);
        }

        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context)
            throw new Error(AVATAR_EDITOR_MESSAGES.CANVAS_UNAVAILABLE);

        context.drawImage(bitmap, 0, 0);
        const { data } = context.getImageData(
            0,
            0,
            bitmap.width,
            bitmap.height
        );
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    } finally {
        bitmap.close();
    }
};
