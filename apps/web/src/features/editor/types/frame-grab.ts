import type { ZoneHandle } from "@/features/editor/types/zone-handle";

// What a press on the frame grabbed: one of the 8 resize handles, or the inside
// of the frame, which moves the whole of it.
export type FrameGrab = ZoneHandle | "move";
