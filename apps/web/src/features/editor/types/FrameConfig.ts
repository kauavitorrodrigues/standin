import type { FrameStore } from "@/features/editor/lib/FrameStore";
import type { FrameLimits } from "@/features/editor/types/frame-limits";

// What turns on the frame of an area in the editor: where its rectangle lives
// and how far it may stretch.
export type FrameConfig = {
    store: FrameStore;
    limits: FrameLimits;
};
