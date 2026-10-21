import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";

type Options = {
    // How far the element rises over its whole life, in px.
    riseY: number;
    // How long it lives, which is when it is gone.
    lifeMs: number;
    // How long it takes to appear, rising in from below its place.
    enterMs: number;
    enterOffsetY: number;
    // The share of its life where it starts to fade, from 0 to 1.
    fadeStart: number;
};

// A message that floats straight up while it lives: it rises in and fades in at
// first, then drifts up and fades out for the last part of its life. The
// element keeps its own opacity (the place in a stack), since the animation
// runs on the element that wraps it. With reduced motion, or where the browser
// has no animations, it stays still until it is removed.
export const useFloatAnimation = (
    ref: RefObject<HTMLElement | null>,
    { riseY, lifeMs, enterMs, enterOffsetY, fadeStart }: Options
): void => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        if (prefersReducedMotion() || typeof element.animate !== "function") {
            return;
        }

        const enterEnd = enterMs / lifeMs;
        element.animate(
            [
                {
                    offset: 0,
                    opacity: 0,
                    transform: `translateY(${enterOffsetY}px) scale(0.96)`,
                    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
                },
                {
                    offset: enterEnd,
                    opacity: 1,
                    transform: "translateY(0) scale(1)",
                    easing: "linear",
                },
                {
                    offset: fadeStart,
                    opacity: 1,
                    transform: `translateY(${-riseY * fadeStart}px) scale(1)`,
                    easing: "linear",
                },
                {
                    offset: 1,
                    opacity: 0,
                    transform: `translateY(${-riseY}px) scale(1)`,
                },
            ],
            { duration: lifeMs, fill: "forwards" }
        );
    }, [ref, riseY, lifeMs, enterMs, enterOffsetY, fadeStart]);
};
