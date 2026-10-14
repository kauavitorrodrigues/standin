import { findTileLayer } from "../../layout/ops/findTileLayer";
import { isCellInside } from "../../layout/ops/isCellInside";
import type { LayerName } from "../../layout/ops.schema";
import type { MapLayout } from "../../schemas/layout.schema";
import type { Cell } from "../types/cell";

/**
 * Connected region (4 neighbours) sharing the gid of `start`, limited to the
 * map, or to `within` (tiles) when given. Returns an empty list when `start` is
 * outside the map or `within`, or the layer is missing.
 */
export const floodFill = (
    layout: MapLayout,
    layer: LayerName,
    start: Cell,
    within?: { x: number; y: number; w: number; h: number }
): Cell[] => {
    const target = findTileLayer(layout, layer);
    const isAllowed = ([x, y]: Cell) =>
        isCellInside(layout, [x, y]) &&
        (!within ||
            (x >= within.x &&
                x < within.x + within.w &&
                y >= within.y &&
                y < within.y + within.h));
    if (!target || !isAllowed(start)) {
        return [];
    }
    const gidAt = ([x, y]: Cell) => target.data[y * layout.width + x];
    const wanted = gidAt(start);
    const visited = new Set<number>([start[1] * layout.width + start[0]]);
    const queue: Cell[] = [start];
    const region: Cell[] = [];
    for (let head = 0; head < queue.length; head++) {
        const cell = queue[head];
        region.push(cell);
        const [x, y] = cell;
        const neighbours: Cell[] = [
            [x, y - 1],
            [x - 1, y],
            [x + 1, y],
            [x, y + 1],
        ];
        for (const next of neighbours) {
            if (!isAllowed(next)) {
                continue;
            }
            const key = next[1] * layout.width + next[0];
            if (visited.has(key) || gidAt(next) !== wanted) {
                continue;
            }
            visited.add(key);
            queue.push(next);
        }
    }
    return region.sort((p, q) => p[1] - q[1] || p[0] - q[0]);
};
