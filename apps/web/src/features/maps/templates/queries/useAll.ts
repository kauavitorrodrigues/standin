import { queryOptions, useQuery } from "@tanstack/react-query";
import type { MapTemplate } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const TEMPLATES_QUERY_KEY = "mapTemplates";

export const templatesQueryOptions = () =>
    queryOptions({
        queryKey: [TEMPLATES_QUERY_KEY],
        queryFn: async (): Promise<MapTemplate[]> => {
            const res = await api.get("/templates");
            return res.data.templates;
        },
    });

export const useAll = () => {
    const query = useQuery(templatesQueryOptions());
    return { ...query, templates: query.data ?? [] };
};
