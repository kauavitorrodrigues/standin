// Runs the first call at once and, if more calls came during the window,
// runs the last of them when the window ends. Calls in between are dropped.
export const throttle = <Args extends unknown[]>(
    run: (...args: Args) => void,
    windowMs: number
): ((...args: Args) => void) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pendingArgs: Args | null = null;

    const openWindow = () => {
        timer = setTimeout(() => {
            timer = null;
            if (!pendingArgs) return;

            const args = pendingArgs;
            pendingArgs = null;
            run(...args);
            openWindow();
        }, windowMs);
    };

    return (...args) => {
        if (timer) {
            pendingArgs = args;
            return;
        }

        run(...args);
        openWindow();
    };
};
