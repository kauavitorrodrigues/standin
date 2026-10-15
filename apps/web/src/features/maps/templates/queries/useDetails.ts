import { queryOptions, useQuery } from "@tanstack/react-query";
import type { MapTemplate } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const TEMPLATE_DETAILS_QUERY_KEY = "templateDetails";

export const templateDetailsQueryOptions = (templateId: string) =>
    queryOptions({
        queryKey: [TEMPLATE_DETAILS_QUERY_KEY, templateId],
        queryFn: async (): Promise<MapTemplate> => {
            const res = await api.get(`/templates/${templateId}`);
            return res.data.template;
        },
        enabled: !!templateId,
    });

export const useDetails = (templateId: string) => {
    const query = useQuery(templateDetailsQueryOptions(templateId));
    return { ...query, template: query.data };
};
