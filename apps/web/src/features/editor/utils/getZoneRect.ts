import type { Cell } from "@standin/contracts";
import type { ZoneRect } from "@/features/editor/types/zone-rect";

// The rectangle of cells between two corners, both included, whichever
// corner the drag started from.
export const getZoneRect = (from: Cell, to: Cell): ZoneRect => {
    const x = Math.min(from[0], to[0]);
    const y = Math.min(from[1], to[1]);
    return {
        x,
        y,
        w: Math.abs(to[0] - from[0]) + 1,
        h: Math.abs(to[1] - from[1]) + 1,
    };
};
