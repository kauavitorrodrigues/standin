import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";

type Options = {
    // How far below its place the element starts, in px.
    offsetY: number;
    durationMs: number;
    // Off, the element simply appears.
    enabled?: boolean;
    // The element also grows from no height, so what is around it moves
    // smoothly instead of jumping when it arrives.
    grows?: boolean;
};

// Makes an element rise and fade in when it mounts. The keyframe has only the
// start, so it ends in whatever the element looks like (its own opacity
// included). With reduced motion, or where the browser has no animations, it
// appears at once.
export const useEnterAnimation = (
    ref: RefObject<HTMLElement | null>,
    { offsetY, durationMs, enabled = true, grows = false }: Options
): void => {
    useEffect(() => {
        const element = ref.current;
        if (!enabled || !element) return;
        if (prefersReducedMotion() || typeof element.animate !== "function") {
            return;
        }

        const from: Keyframe = {
            opacity: 0,
            transform: `translateY(${offsetY}px) scale(0.96)`,
        };
        if (grows) {
            const { paddingTop, paddingBottom } = getComputedStyle(element);
            const to: Keyframe = {
                height: `${element.offsetHeight}px`,
                paddingTop,
                paddingBottom,
            };
            from.height = "0px";
            from.paddingTop = "0px";
            from.paddingBottom = "0px";
            element.animate([from, { ...to, opacity: 1, transform: "none" }], {
                duration: durationMs,
                easing: "cubic-bezier(0.32, 0.72, 0, 1)",
            });
            return;
        }

        element.animate([from], {
            duration: durationMs,
            easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        });
    }, [ref, offsetY, durationMs, enabled, grows]);
};
