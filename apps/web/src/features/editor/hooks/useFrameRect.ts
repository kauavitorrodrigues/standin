import { useSyncExternalStore } from "react";
import type { FrameStore } from "@/features/editor/lib/FrameStore";

// The rectangle of the frame. The component renders again when it changes.
export const useFrameRect = (store: FrameStore) =>
    useSyncExternalStore(store.subscribe, store.getRect);
