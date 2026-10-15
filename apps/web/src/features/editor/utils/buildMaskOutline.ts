import type { OutlineSegment } from "@/features/editor/types/ObjectBounds";

// The edge around the occupied cells of a mask: a side of a cell is drawn only
// where the cell next to it is free or outside the mask, so two occupied cells
// share no line. The mask starts at (originX, originY), in px.
export const buildMaskOutline = (
    mask: readonly (readonly boolean[])[],
    originX: number,
    originY: number,
    cellPx: number
): OutlineSegment[] => {
    const segments: OutlineSegment[] = [];
    const isFree = (row: number, col: number) => !mask[row]?.[col];

    mask.forEach((cells, row) => {
        cells.forEach((occupied, col) => {
            if (!occupied) return;
            const left = originX + col * cellPx;
            const top = originY + row * cellPx;
            const right = left + cellPx;
            const bottom = top + cellPx;

            if (isFree(row - 1, col)) {
                segments.push({ x1: left, y1: top, x2: right, y2: top });
            }
            if (isFree(row + 1, col)) {
                segments.push({ x1: left, y1: bottom, x2: right, y2: bottom });
            }
            if (isFree(row, col - 1)) {
                segments.push({ x1: left, y1: top, x2: left, y2: bottom });
            }
            if (isFree(row, col + 1)) {
                segments.push({ x1: right, y1: top, x2: right, y2: bottom });
            }
        });
    });
    return segments;
};
