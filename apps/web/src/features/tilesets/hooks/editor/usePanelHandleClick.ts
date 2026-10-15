import { useEffect, useRef } from "react";

// How far the pointer may travel and still be a click, not a drag to resize.
const CLICK_TOLERANCE_PX = 3;

// How far from the divider a press still counts as on it. The divider is a
// line, and the library lets it be grabbed from a bit around it.
const HANDLE_REACH_PX = 8;

// `onPressChange` says when the divider is held, so the panel can follow the
// pointer without animating, and animate the rest of the time.
// Tells a click on the divider of the panels from a drag of it, so a click can
// fold the panel and a drag still resizes it. It listens on the window, since a
// press near the divider may land on what is beside it and not on the divider
// itself. The ref goes on the divider, to know where it is.
export const usePanelHandleClick = (
    onClick: () => void,
    onPressChange: (pressed: boolean) => void
) => {
    const handleRef = useRef<HTMLDivElement | null>(null);
    const latest = useRef(onClick);
    const latestPress = useRef(onPressChange);
    useEffect(() => {
        latest.current = onClick;
        latestPress.current = onPressChange;
    });

    useEffect(() => {
        let start: number | null = null;

        const isOnHandle = (x: number) => {
            const rect = handleRef.current?.getBoundingClientRect();
            if (!rect) return false;
            const middle = (rect.left + rect.right) / 2;
            return Math.abs(x - middle) <= HANDLE_REACH_PX;
        };

        const onDown = (event: PointerEvent) => {
            start = isOnHandle(event.clientX) ? event.clientX : null;
            if (start !== null) latestPress.current(true);
        };

        const onUp = (event: PointerEvent) => {
            const from = start;
            start = null;
            if (from === null) return;
            latestPress.current(false);
            if (Math.abs(event.clientX - from) > CLICK_TOLERANCE_PX) return;
            latest.current();
        };

        window.addEventListener("pointerdown", onDown, true);
        window.addEventListener("pointerup", onUp, true);
        return () => {
            window.removeEventListener("pointerdown", onDown, true);
            window.removeEventListener("pointerup", onUp, true);
        };
    }, []);

    return handleRef;
};
