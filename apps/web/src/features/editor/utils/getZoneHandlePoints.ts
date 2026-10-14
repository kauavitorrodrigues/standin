import { TILE_SIZE } from "@standin/contracts";
import { ZONE_HANDLES } from "@/features/editor/consts/zone-handles";
import type { ZoneHandle } from "@/features/editor/types/zone-handle";
import type { ZonePoint } from "@/features/editor/types/zone-point";
import type { ZoneRect } from "@/features/editor/types/zone-rect";

const HALF = 2;

// Where the 8 handles of a rectangle of cells sit, in world px: the corners
// and the middle of each edge.
export const getZoneHandlePoints = (
    rect: ZoneRect
): Record<ZoneHandle, ZonePoint> => {
    const left = rect.x * TILE_SIZE;
    const top = rect.y * TILE_SIZE;
    const width = rect.w * TILE_SIZE;
    const height = rect.h * TILE_SIZE;
    const centerX = left + width / HALF;
    const centerY = top + height / HALF;

    return {
        [ZONE_HANDLES.NORTH_WEST]: { x: left, y: top },
        [ZONE_HANDLES.NORTH_EAST]: { x: left + width, y: top },
        [ZONE_HANDLES.SOUTH_EAST]: { x: left + width, y: top + height },
        [ZONE_HANDLES.SOUTH_WEST]: { x: left, y: top + height },
        [ZONE_HANDLES.NORTH]: { x: centerX, y: top },
        [ZONE_HANDLES.EAST]: { x: left + width, y: centerY },
        [ZONE_HANDLES.SOUTH]: { x: centerX, y: top + height },
        [ZONE_HANDLES.WEST]: { x: left, y: centerY },
    };
};
