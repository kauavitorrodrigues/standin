import { queryOptions, useQuery } from "@tanstack/react-query";
import { WebsitePreviewSchema, type WebsitePreview } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const WEBSITE_PREVIEW_QUERY_KEY = "websitePreview";

// What the server read from the page of the object: its title and icon. It
// only dresses the card, so a failure is not retried and not shown: the card
// keeps the name of the object and a generic icon.
// The address is part of the key, so an object whose address was changed in the
// decorator asks again at once instead of showing the old site for a while.
// Nothing is asked for an object without a valid address.
export const previewQueryOptions = (
    mapId: string,
    objectId: string | null,
    address: string | null
) =>
    queryOptions({
        queryKey: [WEBSITE_PREVIEW_QUERY_KEY, mapId, objectId, address],
        queryFn: async (): Promise<WebsitePreview> => {
            const res = await api.get(
                `/maps/${mapId}/websites/${objectId}/preview`
            );
            return WebsitePreviewSchema.parse(res.data.preview);
        },
        enabled: objectId !== null && address !== null,
        // The server keeps it for an hour, so asking again is cheap.
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

export const usePreview = (
    mapId: string,
    objectId: string | null,
    address: string | null
) => useQuery(previewQueryOptions(mapId, objectId, address));
