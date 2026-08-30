import { queryOptions, useQuery } from "@tanstack/react-query";
import type { MapEntity } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useQueryUtils } from "@/lib/tanstack/useQueryUtils";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

export const ORGANIZATION_MAPS_QUERY_KEY = "mapsByOrganization";

export const organizationMapsQueryOptions = (organizationId: string) =>
    queryOptions({
        queryKey: [ORGANIZATION_MAPS_QUERY_KEY, organizationId],
        queryFn: async (): Promise<MapEntity[]> => {
            const res = await api.get(`/organizations/${organizationId}/maps`);
            return res.data.maps;
        },
        enabled: !!organizationId,
    });

export const useOrganizationMaps = () => {
    const organizationId = useOrganization().organization?.id;
    const query = useQuery({
        ...organizationMapsQueryOptions(organizationId ?? ""),
        enabled: !!organizationId,
    });
    return { ...query, maps: query.data ?? [] };
};

export const useOrganizationMapsQueryUtils = () => {
    const organizationId = useOrganization().organization?.id;
    return useQueryUtils<MapEntity[]>([
        ORGANIZATION_MAPS_QUERY_KEY,
        organizationId!,
    ]);
};
