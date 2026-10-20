import {
    PREVIEW_COLORS,
    PREVIEW_FLOOR_TILE,
    PREVIEW_FLOOR_Y,
    PREVIEW_FRAME_ORIGIN,
    PREVIEW_SCALE,
    PREVIEW_SCENE,
} from "../consts/editor/preview";
import type { PixelRect } from "../types/editor";

// Draws the fixed scene of the preview: a light wall over a light green
// floor, like the editor of the reference.
export const drawPreviewScene = (context: CanvasRenderingContext2D) => {
    const scale = PREVIEW_SCALE;
    const width = PREVIEW_SCENE.w * scale;
    const height = PREVIEW_SCENE.h * scale;
    const floorY = PREVIEW_FLOOR_Y * scale;

    context.fillStyle = PREVIEW_COLORS.WALL;
    context.fillRect(0, 0, width, floorY);
    context.fillStyle = PREVIEW_COLORS.WALL_SHADE;
    context.fillRect(0, floorY - 6 * scale, width, 6 * scale);
    context.fillStyle = PREVIEW_COLORS.BASEBOARD;
    context.fillRect(0, floorY - scale, width, scale);

    context.fillStyle = PREVIEW_COLORS.FLOOR;
    context.fillRect(0, floorY, width, height - floorY);
    context.fillStyle = PREVIEW_COLORS.FLOOR_SHADE;
    const tile = PREVIEW_FLOOR_TILE * scale;
    for (let y = floorY, row = 0; y < height; y += tile, row += 1) {
        for (let x = (row % 2) * tile; x < width; x += tile * 2) {
            context.fillRect(x, y, tile, tile);
        }
    }
};

// Draws one frame of the sheet with its feet on the anchor of the scene.
export const drawPreviewFrame = (
    context: CanvasRenderingContext2D,
    sheet: CanvasImageSource,
    frame: PixelRect
) => {
    context.imageSmoothingEnabled = false;
    context.drawImage(
        sheet,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        PREVIEW_FRAME_ORIGIN.x * PREVIEW_SCALE,
        PREVIEW_FRAME_ORIGIN.y * PREVIEW_SCALE,
        frame.w * PREVIEW_SCALE,
        frame.h * PREVIEW_SCALE
    );
};
