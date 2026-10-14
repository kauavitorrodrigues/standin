import type { Cell } from "@standin/contracts";
import type { TileRect } from "@/features/editor/types/tile-rect";

type Params = {
    rect: TileRect;
    // The cell under the pointer when the drag began, and now.
    from: Cell;
    cell: Cell;
    columns: number;
    rows: number;
};

const clamp = (value: number, max: number): number =>
    Math.min(max, Math.max(0, value));

// The frame moved by the distance the pointer went, in whole tiles, keeping its
// size and staying inside the canvas.
export const moveFrameRect = ({
    rect,
    from,
    cell,
    columns,
    rows,
}: Params): TileRect => ({
    x: clamp(rect.x + cell[0] - from[0], columns - rect.w),
    y: clamp(rect.y + cell[1] - from[1], rows - rect.h),
    w: rect.w,
    h: rect.h,
});
