import { useCallback, useEffect, useRef } from "react";

// A field that opens on a pointerup (the zone name, right after a drag)
// gets the click of that same gesture a moment later. Base UI reads it as a
// press outside and closes the field. Until a new pointerdown lands while it
// is open, a click is the tail of the gesture that opened it, so the
// returned check says to ignore it.
export const useIgnoreOpeningClick = (open: boolean) => {
    const pressedRef = useRef(false);

    useEffect(() => {
        pressedRef.current = false;
        if (!open) return;

        const markPressed = () => {
            pressedRef.current = true;
        };
        document.addEventListener("pointerdown", markPressed, true);
        return () =>
            document.removeEventListener("pointerdown", markPressed, true);
    }, [open]);

    return useCallback(
        (event: Event | undefined): boolean =>
            event?.type === "click" && !pressedRef.current,
        []
    );
};
