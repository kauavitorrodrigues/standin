import { TILE_SIZE, type WallPiece } from "@standin/contracts";
import { RGBA_CHANNELS } from "@/features/assets/consts/solidMask";
import type { PixelData } from "@/features/assets/utils/detectSolidMask";
import { WALL_SHEET_ORDER, WALL_SHEET_ROWS } from "../../consts/wallStyle";
import { getPieceHeightTiles } from "./getPieceHeightTiles";

export const WALL_STRIP_WIDTH = WALL_SHEET_ORDER.length * TILE_SIZE;
export const WALL_STRIP_HEIGHT = WALL_SHEET_ROWS * TILE_SIZE;

export const isWallStrip = (pixels: PixelData): boolean =>
    pixels.width === WALL_STRIP_WIDTH && pixels.height === WALL_STRIP_HEIGHT;

const cut = (strip: PixelData, column: number, rows: number): PixelData => {
    const height = rows * TILE_SIZE;
    const data = new Uint8ClampedArray(TILE_SIZE * height * RGBA_CHANNELS);
    // A tall piece takes both rows of its column, a side piece only the base.
    const firstRow = WALL_SHEET_ROWS - rows;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < TILE_SIZE; x += 1) {
            const source =
                ((firstRow * TILE_SIZE + y) * strip.width +
                    column * TILE_SIZE +
                    x) *
                RGBA_CHANNELS;
            const target = (y * TILE_SIZE + x) * RGBA_CHANNELS;
            for (let channel = 0; channel < RGBA_CHANNELS; channel += 1) {
                data[target + channel] = strip.data[source + channel];
            }
        }
    }
    return { width: TILE_SIZE, height, data };
};

// The eight pieces of a strip in the standard layout: eight columns and two
// rows of tiles, the caps of the tall pieces on the top row and the bases on
// the bottom row.
export const splitWallStrip = (
    strip: PixelData
): Partial<Record<WallPiece, PixelData>> =>
    Object.fromEntries(
        WALL_SHEET_ORDER.map((piece, column) => [
            piece,
            cut(strip, column, getPieceHeightTiles(piece)),
        ])
    );
