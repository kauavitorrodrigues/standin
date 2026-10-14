import { queryOptions, useQuery } from "@tanstack/react-query";
import type { MapTemplatePreview, SizeTier } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const BLANK_PREVIEW_QUERY_KEY = "blankMapPreview";

const PREVIEW_STALE_TIME_MS = 5 * 60 * 1000;

// A blank map of a tier as it will be created, floor and walls included.
// Open to anyone, and nothing is created by asking for it.
export const blankPreviewQueryOptions = (tier: SizeTier) =>
    queryOptions({
        queryKey: [BLANK_PREVIEW_QUERY_KEY, tier],
        queryFn: async (): Promise<MapTemplatePreview> => {
            const res = await api.get(`/templates/blank/${tier}/preview`);
            return res.data.preview;
        },
        staleTime: PREVIEW_STALE_TIME_MS,
    });

export const useBlankPreview = (tier: SizeTier, enabled: boolean) =>
    useQuery({ ...blankPreviewQueryOptions(tier), enabled });
