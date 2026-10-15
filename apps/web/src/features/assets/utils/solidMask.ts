import { SOLID_MASK_SUBDIVISION } from "@standin/contracts";
import type {
    FootprintMasks,
    FootprintMaskValue,
    FootprintTile,
    SolidCell,
    SolidMaskValue,
    SolidPaintAction,
} from "../types/footprintMask";
import type { Footprint } from "../types/spriteGeometry";
import {
    countOccupiedTiles,
    isTileOccupied,
    normalizeMask,
    toggleMaskTile,
    toPayloadMask,
} from "./footprintMask";

const CELLS_PER_TILE = SOLID_MASK_SUBDIVISION * SOLID_MASK_SUBDIVISION;

// A run of solid cells on one row, so the editor draws one box for it.
export type SolidRun = { row: number; col: number; length: number };

// The size of the collision mask of a footprint, in cells.
export const getSolidGrid = (footprint: Footprint) => ({
    cols: footprint.w * SOLID_MASK_SUBDIVISION,
    rows: footprint.h * SOLID_MASK_SUBDIVISION,
});

// The tile of the footprint a cell is in.
export const getTileOfCell = (cell: SolidCell): FootprintTile => ({
    col: Math.floor(cell.col / SOLID_MASK_SUBDIVISION),
    row: Math.floor(cell.row / SOLID_MASK_SUBDIVISION),
});

export const isCellInside = (footprint: Footprint, cell: SolidCell) => {
    const { cols, rows } = getSolidGrid(footprint);
    return cell.col >= 0 && cell.col < cols && cell.row >= 0 && cell.row < rows;
};

// Every cell of the occupied tiles solid, which is how a footprint without a
// collision mask blocks.
export const fillSolidMask = (
    footprint: Footprint,
    mask: FootprintMaskValue
): boolean[][] => {
    const { cols, rows } = getSolidGrid(footprint);
    return Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) =>
            isTileOccupied(mask, getTileOfCell({ col, row }))
        )
    );
};

// The cells that block, with the ones of a missing collision mask worked out.
export const resolveSolidMask = (
    footprint: Footprint,
    mask: FootprintMaskValue,
    solidMask: SolidMaskValue
): boolean[][] => solidMask ?? fillSolidMask(footprint, mask);

export const isSolidCell = (cells: boolean[][], cell: SolidCell): boolean =>
    cells[cell.row]?.[cell.col] ?? false;

export const countSolidCells = (cells: boolean[][]): number =>
    cells.reduce((total, row) => total + row.filter(Boolean).length, 0);

// How many cells the occupied tiles hold, the most that can be solid.
export const countSolidCapacity = (
    footprint: Footprint,
    mask: FootprintMaskValue
): number => countOccupiedTiles(footprint, mask) * CELLS_PER_TILE;

// The collision mask that blocks exactly like the occupied tiles is no mask.
export const normalizeSolidMask = (
    footprint: Footprint,
    mask: FootprintMaskValue,
    cells: boolean[][]
): SolidMaskValue => {
    const full = fillSolidMask(footprint, mask);
    const same = cells.every((row, y) =>
        row.every((solid, x) => solid === full[y][x])
    );
    if (same) return null;
    return cells;
};

// Every cell a straight line from one cell to another crosses, both ends
// included, so a fast drag leaves no gaps between two pointer events.
export const getCellsBetween = (
    from: SolidCell,
    to: SolidCell
): SolidCell[] => {
    const cells: SolidCell[] = [];
    const stepCol = Math.sign(to.col - from.col);
    const stepRow = Math.sign(to.row - from.row);
    const spanCol = Math.abs(to.col - from.col);
    const spanRow = Math.abs(to.row - from.row);
    let { col, row } = from;
    let error = spanCol - spanRow;

    for (let step = 0; step <= spanCol + spanRow; step += 1) {
        cells.push({ col, row });
        if (col === to.col && row === to.row) break;
        const doubled = error * 2;
        if (doubled > -spanRow) {
            error -= spanRow;
            col += stepCol;
        }
        if (doubled < spanCol) {
            error += spanCol;
            row += stepRow;
        }
    }
    return cells;
};

// Every cell of the rectangle between two cells, both corners included.
export const getRectCells = (from: SolidCell, to: SolidCell): SolidCell[] => {
    const cells: SolidCell[] = [];
    for (
        let row = Math.min(from.row, to.row);
        row <= Math.max(from.row, to.row);
        row += 1
    ) {
        for (
            let col = Math.min(from.col, to.col);
            col <= Math.max(from.col, to.col);
            col += 1
        ) {
            cells.push({ col, row });
        }
    }
    return cells;
};

// The cells the bucket reaches from a cell: the ones next to each other that
// are in the same state, inside the occupied tiles. A cell of a free tile
// stops it, since filling it would occupy the tile.
export const getFloodCells = (
    footprint: Footprint,
    masks: FootprintMasks,
    start: SolidCell
): SolidCell[] => {
    const cells = resolveSolidMask(footprint, masks.mask, masks.solidMask);
    const isOpen = (cell: SolidCell) =>
        isCellInside(footprint, cell) &&
        isTileOccupied(masks.mask, getTileOfCell(cell));
    if (!isOpen(start)) return [];

    const state = isSolidCell(cells, start);
    const seen = new Set([`${start.col},${start.row}`]);
    const queue = [start];
    const reached: SolidCell[] = [];
    while (queue.length > 0) {
        const cell = queue.pop() as SolidCell;
        reached.push(cell);
        const around = [
            { col: cell.col + 1, row: cell.row },
            { col: cell.col - 1, row: cell.row },
            { col: cell.col, row: cell.row + 1 },
            { col: cell.col, row: cell.row - 1 },
        ];
        for (const next of around) {
            const key = `${next.col},${next.row}`;
            if (seen.has(key) || !isOpen(next)) continue;
            if (isSolidCell(cells, next) !== state) continue;
            seen.add(key);
            queue.push(next);
        }
    }
    return reached;
};

type PaintParams = {
    footprint: Footprint;
    masks: FootprintMasks;
    cells: SolidCell[];
    action: SolidPaintAction;
};

// The masks after a stroke over some cells. Painting makes the cell solid and
// its tile occupied. Erasing makes it empty, but never the last solid cell,
// since a collision mask needs one. Cells outside the footprint are ignored.
export const paintSolidCells = ({
    footprint,
    masks,
    cells,
    action,
}: PaintParams): FootprintMasks => {
    const next = resolveSolidMask(footprint, masks.mask, masks.solidMask).map(
        (row) => [...row]
    );
    const tiles = Array.from({ length: footprint.h }, (_, row) =>
        Array.from({ length: footprint.w }, (_, col) =>
            isTileOccupied(masks.mask, { col, row })
        )
    );
    let remaining = countSolidCells(next);
    let changed = false;

    for (const cell of cells) {
        if (!isCellInside(footprint, cell)) continue;
        const solid = next[cell.row][cell.col];
        const tile = getTileOfCell(cell);
        if (action === "paint") {
            if (!solid || !tiles[tile.row][tile.col]) changed = true;
            next[cell.row][cell.col] = true;
            tiles[tile.row][tile.col] = true;
            remaining += solid ? 0 : 1;
            continue;
        }
        if (!solid || remaining <= 1) continue;
        next[cell.row][cell.col] = false;
        remaining -= 1;
        changed = true;
    }
    if (!changed) return masks;

    const mask = normalizeMask(tiles);
    return { mask, solidMask: normalizeSolidMask(footprint, mask, next) };
};

// The collision mask with the cells of one tile emptied, or none when no
// solid cell is left.
export const clearSolidTile = (
    cells: boolean[][],
    tile: FootprintTile
): SolidMaskValue => {
    const next = cells.map((row, y) =>
        row.map((solid, x) => {
            const inTile = getTileOfCell({ col: x, row: y });
            if (inTile.col === tile.col && inTile.row === tile.row) {
                return false;
            }
            return solid;
        })
    );
    if (countSolidCells(next) === 0) return null;
    return next;
};

// The masks after a click on a tile in the footprint mode. Freeing the tile
// also empties the solid cells inside it.
export const toggleTileMasks = (
    footprint: Footprint,
    masks: FootprintMasks,
    tile: FootprintTile
): FootprintMasks => {
    const mask = toggleMaskTile(footprint, masks.mask, tile);
    if (mask === masks.mask) return masks;
    if (!masks.solidMask || isTileOccupied(mask, tile)) {
        return { mask, solidMask: masks.solidMask };
    }
    return { mask, solidMask: clearSolidTile(masks.solidMask, tile) };
};

// The runs of solid cells, row by row.
export const getSolidRuns = (cells: boolean[][]): SolidRun[] =>
    cells.flatMap((row, y) => {
        const runs: SolidRun[] = [];
        row.forEach((solid, x) => {
            if (!solid) return;
            const last = runs[runs.length - 1];
            if (last && last.col + last.length === x) {
                last.length += 1;
                return;
            }
            runs.push({ row: y, col: x, length: 1 });
        });
        return runs;
    });

type PayloadParams = {
    footprint: Footprint;
    mask: FootprintMaskValue;
    solidMask: SolidMaskValue;
    // The asset blocks the way, which is when the collision mask matters.
    solid: boolean;
    isAnimated: boolean;
};

// The collision mask as it goes up: only for a still asset that blocks the
// way, and none when it does the same as the occupied tiles.
export const toPayloadSolidMask = ({
    footprint,
    mask,
    solidMask,
    solid,
    isAnimated,
}: PayloadParams): SolidMaskValue => {
    if (!solid || isAnimated || !solidMask) return null;
    return normalizeSolidMask(footprint, toPayloadMask(mask, false), solidMask);
};
