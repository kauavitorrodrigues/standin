import { useEffect } from "react";

// When the connection comes back, tries the apply again, once for each time
// the browser says it is online. It is only listening while `enabled`, which
// is while the dialog of a lost connection is showing.
export const useDecorationRetry = (enabled: boolean, retry: () => void) => {
    useEffect(() => {
        if (!enabled) return;

        window.addEventListener("online", retry);
        return () => window.removeEventListener("online", retry);
    }, [enabled, retry]);
};
