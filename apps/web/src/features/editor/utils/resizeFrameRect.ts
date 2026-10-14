import type { Cell } from "@standin/contracts";
import { ZONE_HANDLES } from "@/features/editor/consts/zone-handles";
import type { FrameLimits } from "@/features/editor/types/frame-limits";
import type { TileRect } from "@/features/editor/types/tile-rect";
import type { ZoneHandle } from "@/features/editor/types/zone-handle";

type Params = {
    rect: TileRect;
    handle: ZoneHandle;
    // The cell under the pointer: the edge the handle drags lands on it.
    cell: Cell;
    columns: number;
    rows: number;
    limits: FrameLimits;
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

// The frame after dragging a handle to a cell. The edges the handle owns snap
// to the cell (the west edge sits on it, the east edge on its far side) and
// the opposite edges stay. The result never leaves the canvas, never goes
// under the minimum on a side and never passes the maximum, so a pointer past
// a limit just stops at it.
export const resizeFrameRect = ({
    rect,
    handle,
    cell,
    columns,
    rows,
    limits,
}: Params): TileRect => {
    const { minSize, maxWidth, maxHeight } = limits;
    let left = rect.x;
    let top = rect.y;
    let right = rect.x + rect.w;
    let bottom = rect.y + rect.h;

    if (movesWest(handle)) {
        left = clamp(cell[0], Math.max(0, right - maxWidth), right - minSize);
    }
    if (movesEast(handle)) {
        right = clamp(
            cell[0] + 1,
            left + minSize,
            Math.min(columns, left + maxWidth)
        );
    }
    if (movesNorth(handle)) {
        top = clamp(cell[1], Math.max(0, bottom - maxHeight), bottom - minSize);
    }
    if (movesSouth(handle)) {
        bottom = clamp(
            cell[1] + 1,
            top + minSize,
            Math.min(rows, top + maxHeight)
        );
    }

    return { x: left, y: top, w: right - left, h: bottom - top };
};
