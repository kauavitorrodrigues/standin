import { ZONE_HANDLE_LIST } from "@/features/editor/consts/zone-handles";
import { ZONE_SELECTION } from "@/features/editor/consts/zone-selection";
import type { ZoneHandle } from "@/features/editor/types/zone-handle";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import { getZoneHandlePoints } from "@/features/editor/utils/getZoneHandlePoints";

type Params = {
    rect: ZoneRect;
    worldX: number;
    worldY: number;
};

const HALF = 2;

// The handle of the rectangle under the point, or null. Corners are tested
// first (ZONE_HANDLE_LIST order).
export const hitTestZoneHandle = ({
    rect,
    worldX,
    worldY,
}: Params): ZoneHandle | null => {
    const points = getZoneHandlePoints(rect);
    const reach = ZONE_SELECTION.HANDLE_HIT_SIZE / HALF;

    for (const handle of ZONE_HANDLE_LIST) {
        const point = points[handle];
        const near =
            Math.abs(worldX - point.x) <= reach &&
            Math.abs(worldY - point.y) <= reach;
        if (near) return handle;
    }

    return null;
};
