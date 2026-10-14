import { EDITOR_THUMBNAIL } from "@/features/editor/consts/thumbnail";
import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";

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
