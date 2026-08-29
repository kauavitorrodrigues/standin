import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Space } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useQueryUtils } from "@/lib/tanstack/useQueryUtils";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

export const ORGANIZATION_SPACES_QUERY_KEY = "spacesByOrganization";

export const organizationSpacesQueryOptions = (organizationId: string) =>
    queryOptions({
        queryKey: [ORGANIZATION_SPACES_QUERY_KEY, organizationId],
        queryFn: async (): Promise<Space[]> => {
            const res = await api.get(
                `/organizations/${organizationId}/spaces`,
            );
            return res.data.spaces;
        },
        enabled: !!organizationId,
    });

export const useOrganizationSpaces = () => {
    const organizationId = useOrganization().organization?.id;
    const query = useQuery({
        ...organizationSpacesQueryOptions(organizationId ?? ""),
        enabled: !!organizationId,
    });
    return { ...query, spaces: query.data ?? [] };
};

export const useOrganizationSpacesQueryUtils = () => {
    const organizationId = useOrganization().organization?.id;
    return useQueryUtils<Space[]>([
        ORGANIZATION_SPACES_QUERY_KEY,
        organizationId!,
    ]);
};
