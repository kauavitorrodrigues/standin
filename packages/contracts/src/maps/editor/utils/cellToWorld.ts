import { TILE_SIZE } from "../../consts/constants";

/** Top left pixel of a cell. */
export const cellToWorld = (x: number, y: number): [number, number] => [
    x * TILE_SIZE,
    y * TILE_SIZE,
];
