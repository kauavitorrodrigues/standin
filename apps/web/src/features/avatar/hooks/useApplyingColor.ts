import { useEffect, useRef, useState } from "react";

// Picking a color redraws the preview on the main thread, which freezes the
// page for a moment. The pick is held back until the browser has painted the
// spinner, and the spinner stays until the color is the chosen one, which is
// when the preview has been rebuilt.
export const useApplyingColor = (isSelected: boolean, apply: () => void) => {
    const [isApplying, setIsApplying] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    // The pick has landed once the color is the chosen one. Adjusted while
    // rendering, so the spinner goes away in the same paint as the new avatar.
    if (isSelected && isApplying) setIsApplying(false);

    useEffect(
        () => () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        },
        []
    );

    const select = () => {
        if (isSelected || isApplying) return;
        setIsApplying(true);
        requestAnimationFrame(() => {
            timeoutRef.current = window.setTimeout(apply, 0);
        });
    };

    return { isApplying, select };
};
