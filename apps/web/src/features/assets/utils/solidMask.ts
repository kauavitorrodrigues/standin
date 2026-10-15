import { SOLID_MASK_SUBDIVISION } from "@standin/contracts";
import type {
    FootprintMasks,
    FootprintMaskValue,
    MaskLayer,
    SolidCell,
    SolidMaskValue,
    SolidPaintAction,
} from "../types/footprintMask";
import type { Footprint } from "../types/spriteGeometry";
import { normalizeMask, resolveMask, toPayloadMask } from "./footprintMask";

// A run of cells on one row, so the editor draws one box for it.
export type SolidRun = { row: number; col: number; length: number };

// The size of the mask of a footprint, in cells.
export const getSolidGrid = (footprint: Footprint) => ({
    cols: footprint.w * SOLID_MASK_SUBDIVISION,
    rows: footprint.h * SOLID_MASK_SUBDIVISION,
});

export const isCellInside = (footprint: Footprint, cell: SolidCell) => {
    const { cols, rows } = getSolidGrid(footprint);
    return cell.col >= 0 && cell.col < cols && cell.row >= 0 && cell.row < rows;
};

// The cells that block, with the ones of a missing collision mask worked out:
// without one, every occupied cell blocks.
export const resolveSolidMask = (
    footprint: Footprint,
    mask: FootprintMaskValue,
    solidMask: SolidMaskValue
): boolean[][] => solidMask ?? resolveMask(footprint, mask);

export const isSolidCell = (cells: boolean[][], cell: SolidCell): boolean =>
    cells[cell.row]?.[cell.col] ?? false;

export const countSolidCells = (cells: boolean[][]): number =>
    cells.reduce((total, row) => total + row.filter(Boolean).length, 0);

// The collision mask that blocks exactly like the occupied cells is no mask.
export const normalizeSolidMask = (
    footprint: Footprint,
    mask: FootprintMaskValue,
    cells: boolean[][]
): SolidMaskValue => {
    const occupied = resolveMask(footprint, mask);
    const same = cells.every((row, y) =>
        row.every((solid, x) => solid === occupied[y][x])
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
// are in the same state in the layer being edited. The collision only reaches
// cells the footprint occupies, since a cell outside it cannot block.
export const getFloodCells = (
    footprint: Footprint,
    masks: FootprintMasks,
    start: SolidCell,
    layer: MaskLayer
): SolidCell[] => {
    const occupied = resolveMask(footprint, masks.mask);
    const cells =
        layer === "footprint"
            ? occupied
            : resolveSolidMask(footprint, masks.mask, masks.solidMask);
    const isOpen = (cell: SolidCell) =>
        isCellInside(footprint, cell) &&
        (layer === "footprint" || isSolidCell(occupied, cell));
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
    layer: MaskLayer;
};

// The masks after a stroke over some cells. In the footprint layer, painting
// occupies a cell and erasing frees it, which also stops it from blocking. In
// the collision layer, painting makes a cell block and occupied, and erasing
// stops it from blocking. Neither layer ever loses its last cell, and a
// collision that followed the footprint keeps following it. Cells outside the
// footprint are ignored.
export const paintCells = ({
    footprint,
    masks,
    cells,
    action,
    layer,
}: PaintParams): FootprintMasks => {
    const occupied = resolveMask(footprint, masks.mask).map((row) => [...row]);
    const solid = resolveSolidMask(footprint, masks.mask, masks.solidMask).map(
        (row) => [...row]
    );
    const follows = masks.solidMask === null;
    let occupiedLeft = countSolidCells(occupied);
    let solidLeft = countSolidCells(solid);
    let changed = false;

    for (const { col, row } of cells) {
        if (!isCellInside(footprint, { col, row })) continue;
        const isOccupied = occupied[row][col];
        const isSolid = solid[row][col];

        if (layer === "footprint" && action === "paint") {
            if (isOccupied) continue;
            occupied[row][col] = true;
            occupiedLeft += 1;
            if (follows) {
                solid[row][col] = true;
                solidLeft += 1;
            }
            changed = true;
            continue;
        }
        if (layer === "footprint") {
            if (!isOccupied || occupiedLeft <= 1) continue;
            if (isSolid && solidLeft <= 1) continue;
            occupied[row][col] = false;
            occupiedLeft -= 1;
            if (isSolid) {
                solid[row][col] = false;
                solidLeft -= 1;
            }
            changed = true;
            continue;
        }
        if (action === "paint") {
            if (isSolid && isOccupied) continue;
            if (!isOccupied) {
                occupied[row][col] = true;
                occupiedLeft += 1;
            }
            if (!isSolid) {
                solid[row][col] = true;
                solidLeft += 1;
            }
            changed = true;
            continue;
        }
        if (!isSolid || solidLeft <= 1) continue;
        solid[row][col] = false;
        solidLeft -= 1;
        changed = true;
    }
    if (!changed) return masks;

    const mask = normalizeMask(occupied);
    return { mask, solidMask: normalizeSolidMask(footprint, mask, solid) };
};

// The runs of cells, row by row.
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
// way, and none when it does the same as the occupied cells.
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
