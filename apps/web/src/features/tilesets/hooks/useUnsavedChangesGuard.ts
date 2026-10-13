import { useRef } from "react";
import { useBlocker } from "@tanstack/react-router";

// Blocks leaving the page while there are changes that were not saved, in the
// app (`stay` and `leave` answer the dialog) and on closing the tab.
// `release` lets the page leave on purpose, after it saved or deleted what it
// shows.
export const useUnsavedChangesGuard = (dirty: boolean) => {
    const released = useRef(false);

    const resolver = useBlocker({
        shouldBlockFn: () => dirty && !released.current,
        enableBeforeUnload: () => dirty && !released.current,
        withResolver: true,
    });

    const stay = () => {
        if (resolver.status !== "blocked") return;
        resolver.reset();
    };

    const leave = () => {
        if (resolver.status !== "blocked") return;
        resolver.proceed();
    };

    const release = () => {
        released.current = true;
    };

    return { blocked: resolver.status === "blocked", stay, leave, release };
};
