import type { OnboardingFlowOptions } from "../types/flow";

// Remembers the `onEnd` of the flow on screen and calls it once, whichever way
// the flow ends: closed, replaced by another or dropped with the screen.
export function createFlowLifecycle() {
    let onEnd: OnboardingFlowOptions["onEnd"];

    const end = (isUnmounting: boolean) => {
        const pending = onEnd;
        onEnd = undefined;
        pending?.({ isUnmounting });
    };

    return {
        // A flow that starts ends the one before it.
        begin: (options?: OnboardingFlowOptions) => {
            end(false);
            onEnd = options?.onEnd;
        },
        end,
    };
}
