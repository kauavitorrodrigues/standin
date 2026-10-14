import { EDITOR_THUMBNAIL } from "@/features/maps/__shared__/consts/thumbnail";
import { THUMBNAIL_MESSAGES } from "@/features/maps/__shared__/consts/messages";

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
    new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error(THUMBNAIL_MESSAGES.ENCODE_FAILED));
                return;
            }
            resolve(blob);
        }, EDITOR_THUMBNAIL.MIME_TYPE);
    });
