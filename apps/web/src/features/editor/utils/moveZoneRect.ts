import type { Cell } from "@standin/contracts";
import type { ZoneRect } from "@/features/editor/types/zone-rect";

type Params = {
    rect: ZoneRect;
    delta: Cell;
    columns: number;
    rows: number;
};

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

// The rectangle shifted by the delta, kept inside the map (it stops at the
// edge, the size does not change).
export const moveZoneRect = ({
    rect,
    delta,
    columns,
    rows,
}: Params): ZoneRect => ({
    ...rect,
    x: clamp(rect.x + delta[0], 0, Math.max(0, columns - rect.w)),
    y: clamp(rect.y + delta[1], 0, Math.max(0, rows - rect.h)),
});
