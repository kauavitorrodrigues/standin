import {
    SOLID_MASK_SUBDIVISION,
    TILE_SIZE,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import type { PlacedRect } from "@/features/game/utils/placed";

type PlacedRef = Pick<PlacedAsset, "tileX" | "tileY" | "offsetX" | "offsetY">;
type FootprintRef = Pick<
    AssetDefinition["footprint"],
    "w" | "h" | "mask" | "solidMask"
>;

type Run = { start: number; length: number };
type OpenRect = Run & { top: number; rows: number };

// The runs of solid cells of one row, as a start column and a length.
const findRuns = (row: readonly boolean[]): Run[] => {
    const runs: Run[] = [];
    row.forEach((solid, column) => {
        if (!solid) return;
        const last = runs[runs.length - 1];
        if (last && last.start + last.length === column) {
            last.length += 1;
            return;
        }
        runs.push({ start: column, length: 1 });
    });
    return runs;
};

type Grid = {
    // One list of flags per row, from the top of the footprint.
    cells: readonly (readonly boolean[])[];
    // Side of one cell, in px.
    cellPx: number;
};

// Each run of solid cells is a rectangle, and runs with the same columns on
// consecutive rows are merged into one, so the physics world gets few bodies.
const gridToRects = (
    { cells, cellPx }: Grid,
    left: number,
    top: number
): PlacedRect[] => {
    const open = new Map<string, OpenRect>();
    const rects: OpenRect[] = [];

    cells.forEach((row, rowIndex) => {
        findRuns(row).forEach(({ start, length }) => {
            const key = `${start}:${length}`;
            const previous = open.get(key);
            if (previous && previous.top + previous.rows === rowIndex) {
                previous.rows += 1;
                return;
            }
            const created = { start, length, top: rowIndex, rows: 1 };
            open.set(key, created);
            rects.push(created);
        });
    });

    return rects.map((rect) => ({
        x: left + rect.start * cellPx,
        y: top + rect.top * cellPx,
        width: rect.length * cellPx,
        height: rect.rows * cellPx,
    }));
};

// The grid that says what blocks: the collision mask when there is one, else
// the tile mask. Null when the whole footprint blocks.
const pickGrid = ({ mask, solidMask }: FootprintRef): Grid | null => {
    if (solidMask) {
        return {
            cells: solidMask,
            cellPx: TILE_SIZE / SOLID_MASK_SUBDIVISION,
        };
    }
    if (mask) return { cells: mask, cellPx: TILE_SIZE };
    return null;
};

/**
 * The rectangles, in px, that block the way for an object on the ground. An
 * object without a mask is one rectangle over its whole footprint. With a tile
 * mask each run of occupied tiles is a rectangle, and with a collision mask
 * each run of solid cells (an eighth of a tile wide), so the player bumps into
 * the drawn part of the piece and not into the air around it. The anchor is the
 * bottom left cell of the footprint.
 */
export const buildSolidRects = (
    placed: PlacedRef,
    footprint: FootprintRef
): PlacedRect[] => {
    const { w, h } = footprint;
    const left = placed.tileX * TILE_SIZE + placed.offsetX;
    const top = (placed.tileY - h + 1) * TILE_SIZE + placed.offsetY;

    const grid = pickGrid(footprint);
    if (!grid) {
        return [
            { x: left, y: top, width: w * TILE_SIZE, height: h * TILE_SIZE },
        ];
    }
    return gridToRects(grid, left, top);
};
