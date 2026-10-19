import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sheetPixelsQuery } from "../queries/useSheetPixels";

// Fetches and decodes the sheets in the background once the browser is idle,
// into the same cache the preview reads. Picking one of them later finds it
// ready, so only the redraw is left.
export const usePrefetchSheets = (urls: readonly string[]) => {
    const queryClient = useQueryClient();
    const key = urls.join("|");

    useEffect(() => {
        if (key === "") return;
        const pending = key.split("|");
        const handle = window.setTimeout(() => {
            for (const url of pending) {
                void queryClient.prefetchQuery(sheetPixelsQuery(url));
            }
        }, 150);
        return () => window.clearTimeout(handle);
    }, [key, queryClient]);
};
