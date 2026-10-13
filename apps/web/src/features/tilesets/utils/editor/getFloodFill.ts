import type { TileMeta } from "@standin/contracts";
import type { TileSheetGrid } from "../../types/sheet";

const NEIGHBORS = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
] as const;

const getKind = (meta: TileMeta, index: number) =>
    meta[String(index)]?.category ?? "UNTAGGED";

// The tiles that touch the start one, side by side, and share its category (or
// the lack of one). It is what the bucket fills.
export const getTileFloodFill = (
    meta: TileMeta,
    start: number,
    grid: Pick<TileSheetGrid, "columns" | "rows">
): number[] => {
    const kind = getKind(meta, start);
    const seen = new Set([start]);
    const queue = [start];

    for (let head = 0; head < queue.length; head++) {
        const index = queue[head]!;
        const column = index % grid.columns;
        const row = Math.floor(index / grid.columns);

        for (const [dx, dy] of NEIGHBORS) {
            const nextColumn = column + dx;
            const nextRow = row + dy;
            if (nextColumn < 0 || nextColumn >= grid.columns) continue;
            if (nextRow < 0 || nextRow >= grid.rows) continue;
            const next = nextRow * grid.columns + nextColumn;
            if (seen.has(next) || getKind(meta, next) !== kind) continue;
            seen.add(next);
            queue.push(next);
        }
    }
    return queue;
};
