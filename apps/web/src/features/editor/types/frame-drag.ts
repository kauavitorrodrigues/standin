import type { Cell } from "@standin/contracts";
import type { FrameGrab } from "@/features/editor/types/frame-grab";
import type { TileRect } from "@/features/editor/types/tile-rect";

// A drag of the frame: what was grabbed, the frame when the press began, and
// the cell under the pointer at that moment.
export type FrameDrag = {
    grab: FrameGrab;
    start: TileRect;
    from: Cell;
};
