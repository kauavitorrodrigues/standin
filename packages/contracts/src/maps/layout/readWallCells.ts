import { LAYOUT_LAYER_NAMES } from "../schemas/layout.schema";
import type { LooseLayout } from "./types";

export const cellKey = (column: number, row: number): string =>
    `${column},${row}`;

// The only place that knows how walls are stored: a tile with a gid above 0 on
// the `walls` tile layer. Everything else asks for the cells it returns.
// A missing layer or a malformed one reads as no walls.
export const readWallCells = (layout: LooseLayout): ReadonlySet<string> => {
    const cells = new Set<string>();
    const layer = layout.layers?.find(
        (candidate) => candidate.name === LAYOUT_LAYER_NAMES.WALLS
    );
    const width = layer?.width ?? layout.width;
    if (!layer || !Array.isArray(layer.data) || !width || width <= 0) {
        return cells;
    }

    layer.data.forEach((gid, index) => {
        if (typeof gid !== "number" || gid <= 0) return;
        cells.add(cellKey(index % width, Math.floor(index / width)));
    });

    return cells;
};
