import { TILE_BORDER_SHADE } from "../consts/png";
import type { Rgba } from "../types/rgba";
import { encodePng } from "./encodePng";

const FRAME_SHADE_STEP = 24;
const MAX_CHANNEL = 255;

const shade = (color: Rgba, amount: number): Rgba => [
    Math.max(0, Math.min(MAX_CHANNEL, color[0] + amount)),
    Math.max(0, Math.min(MAX_CHANNEL, color[1] + amount)),
    Math.max(0, Math.min(MAX_CHANNEL, color[2] + amount)),
    color[3],
];

/**
 * Placeholder art for an asset: a flat colored rectangle with a darker
 * border. With `frames` above 1 it is a horizontal strip whose frames get
 * lighter one after the other, so an animation is visible.
 */
export const buildColorSprite = (
    frameWidth: number,
    frameHeight: number,
    color: Rgba,
    frames = 1
): Buffer => {
    const width = frameWidth * frames;
    const pixels: Rgba[] = [];

    for (let y = 0; y < frameHeight; y++) {
        for (let x = 0; x < width; x++) {
            const frame = Math.floor(x / frameWidth);
            const localX = x % frameWidth;
            const isBorder =
                localX === 0 ||
                y === 0 ||
                localX === frameWidth - 1 ||
                y === frameHeight - 1;
            pixels.push(
                shade(
                    color,
                    frame * FRAME_SHADE_STEP -
                        (isBorder ? TILE_BORDER_SHADE : 0)
                )
            );
        }
    }

    return encodePng(width, frameHeight, pixels);
};
