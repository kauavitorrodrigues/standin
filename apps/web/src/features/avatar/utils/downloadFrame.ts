import { AVATAR } from "@standin/contracts";
import {
    AVATAR_DOWNLOAD_FILE_NAME,
    AVATAR_DOWNLOAD_SCALE,
} from "../consts/editor/preview";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";
import type { PixelRect } from "../types/editor";

// Draws a rectangle of a sheet canvas, enlarged by an integer scale, and
// returns the PNG. Nothing goes to the server.
export const renderFramePng = (
    sheet: HTMLCanvasElement,
    frame: PixelRect,
    scale: number
): Promise<Blob> =>
    new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = frame.w * scale;
        canvas.height = frame.h * scale;
        const context = canvas.getContext("2d");
        if (!context) {
            reject(new Error(AVATAR_EDITOR_MESSAGES.CANVAS_UNAVAILABLE));
            return;
        }

        context.imageSmoothingEnabled = false;
        context.drawImage(
            sheet,
            frame.x,
            frame.y,
            frame.w,
            frame.h,
            0,
            0,
            canvas.width,
            canvas.height
        );
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error(AVATAR_EDITOR_MESSAGES.DOWNLOAD_FAILED));
        }, "image/png");
    });

// The front frame of the avatar, at 8x, saved as a file.
export const downloadAvatarFrame = async (sheet: HTMLCanvasElement) => {
    const blob = await renderFramePng(
        sheet,
        { x: 0, y: 0, w: AVATAR.frame.w, h: AVATAR.frame.h },
        AVATAR_DOWNLOAD_SCALE
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = AVATAR_DOWNLOAD_FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);
};
