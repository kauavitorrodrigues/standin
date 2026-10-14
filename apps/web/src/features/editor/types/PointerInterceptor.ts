import type { ToolPointerInput } from "@/features/editor/types/ToolInput";

// Something that may take a press before the active tool sees it, and then
// owns the pointer until the release. The frame of an area is one.
export type PointerInterceptor = {
    // True when it took the press.
    press: (input: ToolPointerInput) => boolean;
    move: (input: ToolPointerInput) => void;
    release: (input: ToolPointerInput) => void;
    // A move with no press running, to show what a press would grab.
    hover: (input: ToolPointerInput) => void;
    cancel: () => void;
};
