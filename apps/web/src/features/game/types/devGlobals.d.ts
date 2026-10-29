export {};

declare global {
    interface Window {
        // Dev only, see utils/glCallProfiler.ts: counts the GL calls of the
        // game for this many seconds (5 by default) and says what a render pass
        // cost.
        __glProfile?: (
            seconds?: number
        ) => Promise<import("../utils/glCallProfiler").GlProfile>;
    }
}
