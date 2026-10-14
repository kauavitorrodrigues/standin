import { queryOptions, useQuery } from "@tanstack/react-query";
import type { MapTemplatePreview } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const TEMPLATE_PREVIEW_QUERY_KEY = "mapTemplatePreview";

const PREVIEW_STALE_TIME_MS = 5 * 60 * 1000;

// Open to anyone, so it needs no organization. Only a published global
// template answers.
export const templatePreviewQueryOptions = (templateId: string) =>
    queryOptions({
        queryKey: [TEMPLATE_PREVIEW_QUERY_KEY, templateId],
        queryFn: async (): Promise<MapTemplatePreview> => {
            const res = await api.get(`/templates/${templateId}/preview`);
            return res.data.preview;
        },
        staleTime: PREVIEW_STALE_TIME_MS,
    });

// The query only runs while `enabled`, so a list of templates does not fetch
// the map of every one of them.
export const usePreview = (templateId: string, enabled: boolean) =>
    useQuery({ ...templatePreviewQueryOptions(templateId), enabled });
