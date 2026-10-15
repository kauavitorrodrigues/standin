import { TILE_SIZE } from "@standin/contracts";
import { TILE_BORDER_SHADE } from "../consts/png";
import type { Rgba } from "../types/rgba";
import { encodePng } from "./encodePng";

/** A tileset of flat colored tiles laid out in one row. */
export const buildColorTileset = (colors: Rgba[]): Buffer => {
    const width = colors.length * TILE_SIZE;
    const pixels: Rgba[] = [];

    for (let y = 0; y < TILE_SIZE; y++) {
        for (let x = 0; x < width; x++) {
            const color = colors[Math.floor(x / TILE_SIZE)];
            const isBorder = x % TILE_SIZE === 0 || y === 0;
            pixels.push(
                isBorder
                    ? [
                          color[0] - TILE_BORDER_SHADE,
                          color[1] - TILE_BORDER_SHADE,
                          color[2] - TILE_BORDER_SHADE,
                          color[3],
                      ]
                    : color
            );
        }
    }

    return encodePng(width, TILE_SIZE, pixels);
};
