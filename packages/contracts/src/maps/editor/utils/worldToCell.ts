import { TILE_SIZE } from "../../consts/constants";
import type { Cell } from "../types/cell";

/** Cell that contains a pixel position. */
export const worldToCell = (px: number, py: number): Cell => [
    Math.floor(px / TILE_SIZE),
    Math.floor(py / TILE_SIZE),
];
