import { TILE_SIZE } from "@standin/contracts";
import type { PlacedRect } from "@/features/game/utils/placed";

type Point = { x: number; y: number };

export type FreeCellSearch = {
    // Where the avatar is, in px.
    point: Point;
    // The rectangles that block the way, in px.
    solidRects: readonly PlacedRect[];
    // Radius of the avatar, so it does not rest touching a solid.
    radius: number;
    // Size of the map, in px. Cells outside it are never free.
    bounds: { width: number; height: number };
};

const hitsRect = (center: Point, radius: number, rect: PlacedRect): boolean => {
    const nearestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.width));
    const nearestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.height));
    return Math.hypot(center.x - nearestX, center.y - nearestY) < radius;
};

// Whether an avatar of this radius centered here overlaps a solid.
export const isPositionBlocked = (
    center: Point,
    radius: number,
    solidRects: readonly PlacedRect[]
): boolean => solidRects.some((rect) => hitsRect(center, radius, rect));

const getRingCells = (
    column: number,
    row: number,
    ring: number
): { column: number; row: number }[] => {
    if (ring === 0) return [{ column, row }];

    const cells: { column: number; row: number }[] = [];
    for (let offset = -ring; offset <= ring; offset++) {
        cells.push({ column: column + offset, row: row - ring });
        cells.push({ column: column + offset, row: row + ring });
    }
    for (let offset = -ring + 1; offset <= ring - 1; offset++) {
        cells.push({ column: column - ring, row: row + offset });
        cells.push({ column: column + ring, row: row + offset });
    }
    return cells;
};

/**
 * The center of the free cell closest to the point, or null when the map has
 * none. A cell is free when an avatar centered on it overlaps no solid and the
 * cell is inside the map. Cells are searched in rings around the point's cell,
 * and the ring after the first hit is searched too, since a corner of the
 * first ring can be farther than the middle of the next.
 */
export const findNearestFreeCell = ({
    point,
    solidRects,
    radius,
    bounds,
}: FreeCellSearch): Point | null => {
    const columns = Math.floor(bounds.width / TILE_SIZE);
    const rows = Math.floor(bounds.height / TILE_SIZE);
    const column = Math.min(
        columns - 1,
        Math.max(0, Math.floor(point.x / TILE_SIZE))
    );
    const row = Math.min(
        rows - 1,
        Math.max(0, Math.floor(point.y / TILE_SIZE))
    );
    const maxRing = Math.max(columns, rows);

    let best: Point | null = null;
    let bestDistance = Infinity;
    let hitRing: number | null = null;

    for (let ring = 0; ring <= maxRing; ring++) {
        if (hitRing !== null && ring > hitRing + 1) break;

        for (const cell of getRingCells(column, row, ring)) {
            const inside =
                cell.column >= 0 &&
                cell.column < columns &&
                cell.row >= 0 &&
                cell.row < rows;
            if (!inside) continue;

            const center = {
                x: (cell.column + 0.5) * TILE_SIZE,
                y: (cell.row + 0.5) * TILE_SIZE,
            };
            if (isPositionBlocked(center, radius, solidRects)) continue;

            const distance = Math.hypot(center.x - point.x, center.y - point.y);
            if (distance >= bestDistance) continue;

            best = center;
            bestDistance = distance;
            hitRing ??= ring;
        }
    }

    return best;
};
