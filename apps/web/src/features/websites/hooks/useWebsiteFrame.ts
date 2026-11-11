import { useEffect, useState, type SyntheticEvent } from "react";
import { WEBSITE_FRAME_LOAD_TIMEOUT_MS } from "../consts/frame";
import type { WebsiteFrameStatus } from "../types/frame";
import { isFrameOnAppOrigin } from "../utils/isFrameOnAppOrigin";

// The state of one frame: it starts loading, ends loaded or in an error, and
// is closed if the page it lands on is the app itself. The component that uses
// it is keyed by the address, so a new address starts over.
export const useWebsiteFrame = (onAppOrigin: () => void) => {
    const [status, setStatus] = useState<WebsiteFrameStatus>("loading");

    useEffect(() => {
        const timer = setTimeout(
            () =>
                setStatus((current) =>
                    current === "loading" ? "timeout" : current
                ),
            WEBSITE_FRAME_LOAD_TIMEOUT_MS
        );
        return () => clearTimeout(timer);
    }, []);

    const handleLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
        if (isFrameOnAppOrigin(event.currentTarget, window.location.origin)) {
            console.warn("Embedded website on the app origin, frame closed");
            return onAppOrigin();
        }
        setStatus("loaded");
    };

    const handleError = () => setStatus("failed");

    return { status, handleLoad, handleError };
};
