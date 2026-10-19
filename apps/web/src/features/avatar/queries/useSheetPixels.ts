import { useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { AVATAR_SHEET_PIXELS_QUERY_KEY } from "../consts/editor/queryKeys";
import type { SheetPixelsByUrl } from "../types/editor";
import { decodeSheet } from "../utils/decodeSheet";

export const sheetPixelsQuery = (url: string) => ({
    queryKey: [AVATAR_SHEET_PIXELS_QUERY_KEY, url],
    queryFn: () => decodeSheet(url),
    // A sheet url never changes its content, a new file gets a new id.
    staleTime: Infinity,
    retry: false,
});

type SheetPixelsResult = {
    pixels: SheetPixelsByUrl;
    isLoading: boolean;
    hasError: boolean;
};

// Decodes every sheet of the list once and shares the result between the
// preview and the thumbnails. `urls` has to be a stable array, because the
// combined result is kept for as long as it and the queries stay the same.
export const useSheetPixels = (urls: readonly string[]): SheetPixelsResult => {
    const combine = useCallback(
        (results: UseQueryResult<Uint8Array>[]): SheetPixelsResult => {
            const pixels = new Map<string, Uint8Array>();
            results.forEach((result, index) => {
                if (result.data) pixels.set(urls[index], result.data);
            });
            return {
                pixels,
                isLoading: results.some((result) => result.isPending),
                hasError: results.some((result) => result.isError),
            };
        },
        [urls]
    );

    return useQueries({ queries: urls.map(sheetPixelsQuery), combine });
};
