import { ZONE_AREA_MIN_TILES, type Cell } from "@standin/contracts";
import { ZONE_HANDLES } from "@/features/maps/__shared__/consts/zone-handles";
import type { ZoneHandle } from "@/features/maps/__shared__/types/zone-handle";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

type Params = {
    rect: ZoneRect;
    handle: ZoneHandle;
    // The cell under the pointer: the edge the handle drags lands on it.
    cell: Cell;
    columns: number;
    rows: number;
};

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

const movesWest = (handle: ZoneHandle): boolean =>
    handle === ZONE_HANDLES.WEST ||
    handle === ZONE_HANDLES.NORTH_WEST ||
    handle === ZONE_HANDLES.SOUTH_WEST;

const movesEast = (handle: ZoneHandle): boolean =>
    handle === ZONE_HANDLES.EAST ||
    handle === ZONE_HANDLES.NORTH_EAST ||
    handle === ZONE_HANDLES.SOUTH_EAST;

const movesNorth = (handle: ZoneHandle): boolean =>
    handle === ZONE_HANDLES.NORTH ||
    handle === ZONE_HANDLES.NORTH_WEST ||
    handle === ZONE_HANDLES.NORTH_EAST;

const movesSouth = (handle: ZoneHandle): boolean =>
    handle === ZONE_HANDLES.SOUTH ||
    handle === ZONE_HANDLES.SOUTH_WEST ||
    handle === ZONE_HANDLES.SOUTH_EAST;

// The rectangle after dragging a handle to a cell. The edges the handle owns
// follow the cell (the west edge sits on the cell, the east edge on its far
// side); the opposite edges stay. The result never leaves the map and never
// goes below ZONE_AREA_MIN_TILES on a side, so the pointer past the limit
// just stops at it.
export const resizeZoneRect = ({
    rect,
    handle,
    cell,
    columns,
    rows,
}: Params): ZoneRect => {
    let left = rect.x;
    let top = rect.y;
    let right = rect.x + rect.w;
    let bottom = rect.y + rect.h;

    if (movesWest(handle)) {
        left = clamp(cell[0], 0, right - ZONE_AREA_MIN_TILES);
    }
    if (movesEast(handle)) {
        right = clamp(cell[0] + 1, left + ZONE_AREA_MIN_TILES, columns);
    }
    if (movesNorth(handle)) {
        top = clamp(cell[1], 0, bottom - ZONE_AREA_MIN_TILES);
    }
    if (movesSouth(handle)) {
        bottom = clamp(cell[1] + 1, top + ZONE_AREA_MIN_TILES, rows);
    }

    return { x: left, y: top, w: right - left, h: bottom - top };
};
