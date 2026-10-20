import {
    AVATAR,
    AVATAR_SHEET_PX,
    AVATAR_SHEET_SLOTS,
    type AvatarSheetSlot,
} from "@standin/contracts";
import type { SheetColor } from "../../consts/sheet-art";

const CHANNELS = 4;
const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;

// A small picture, one color per pixel or `null` for a transparent one.
export type Sprite = {
    w: number;
    h: number;
    pixels: (SheetColor | null)[];
};

// What a frame of the sheet shows: its direction, its kind of pose and its
// position inside the group of frames of that kind.
export type SheetFrame = AvatarSheetSlot;

// A full sheet in RGBA, transparent.
export const createSheet = (): Uint8Array =>
    new Uint8Array(AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h * CHANNELS);

export const createSprite = (w: number, h: number): Sprite => ({
    w,
    h,
    pixels: Array.from({ length: w * h }, () => null),
});

export const setSpritePixel = (
    sprite: Sprite,
    x: number,
    y: number,
    color: SheetColor | null
): void => {
    if (x < 0 || y < 0 || x >= sprite.w || y >= sprite.h) return;
    sprite.pixels[y * sprite.w + x] = color;
};

export const fillSpriteRect = (
    sprite: Sprite,
    rect: { x: number; y: number; w: number; h: number },
    color: SheetColor
): void => {
    for (let y = rect.y; y < rect.y + rect.h; y++) {
        for (let x = rect.x; x < rect.x + rect.w; x++) {
            setSpritePixel(sprite, x, y, color);
        }
    }
};

// Draws the sprite on a frame of the sheet. `x` and `y` are the position of
// the sprite inside the frame. Pixels that fall outside the frame are cut.
export const paintSprite = (
    sheet: Uint8Array,
    frame: { col: number; row: number },
    sprite: Sprite,
    at: { x: number; y: number }
): void => {
    for (let y = 0; y < sprite.h; y++) {
        for (let x = 0; x < sprite.w; x++) {
            const color = sprite.pixels[y * sprite.w + x];
            const frameX = at.x + x;
            const frameY = at.y + y;
            const isInside =
                frameX >= 0 &&
                frameY >= 0 &&
                frameX < AVATAR.frame.w &&
                frameY < AVATAR.frame.h;
            if (!color || !isInside) continue;

            const sheetX = frame.col * AVATAR.frame.w + frameX;
            const sheetY = frame.row * AVATAR.frame.h + frameY;
            const offset = (sheetY * AVATAR_SHEET_PX.w + sheetX) * CHANNELS;
            sheet[offset + RED] = color[RED];
            sheet[offset + GREEN] = color[GREEN];
            sheet[offset + BLUE] = color[BLUE];
            sheet[offset + ALPHA] = color[ALPHA];
        }
    }
};

// Calls `draw` once for every frame of the sheet, in order, with the row and
// the column (always row 0, the sheet is one row). Every column is drawn, the
// ones with no animation yet included.
export const forEachSheetFrame = (
    draw: (frame: SheetFrame, cell: { col: number; row: number }) => void
): void => {
    AVATAR_SHEET_SLOTS.forEach((slot, col) => {
        draw(slot, { col, row: 0 });
    });
};
