import type { ZoneHandle } from "@/features/editor/types/zone-handle";

// What a press on the frame grabbed: one of the 8 resize handles, or the grip
// that moves the whole frame.
export type FrameGrab = ZoneHandle | "move";
