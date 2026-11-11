/**
 * Calls `onDwell` with the id of a target once the mouse has rested on it for
 * `delayMs`. A change of target starts over, and leaving cancels. A repeat of
 * the same target (the hover is told again while the camera moves) changes
 * nothing, so a moving camera does not keep the timer from ever ending.
 */
export const createHoverDwell = (
    delayMs: number,
    onDwell: (id: string) => void
) => {
    let currentId: string | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cancel = () => {
        if (timer) clearTimeout(timer);
        timer = null;
    };

    return {
        hover: (id: string | null) => {
            if (id === currentId) return;

            cancel();
            currentId = id;
            if (id === null) return;

            timer = setTimeout(() => {
                timer = null;
                onDwell(id);
            }, delayMs);
        },
        cancel: () => {
            cancel();
            currentId = null;
        },
    };
};
