import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Organization } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useQueryUtils } from "@/lib/tanstack/useQueryUtils";

export const ORGANIZATIONS_QUERY_KEY = ["organizations"] as const;

export const organizationsQueryOptions = () =>
    queryOptions({
        queryKey: ORGANIZATIONS_QUERY_KEY,
        queryFn: async (): Promise<Organization[]> => {
            const res = await api.get("/organizations");
            return res.data.organizations;
        },
    });

export const useOrganizations = () => {
    const query = useQuery(organizationsQueryOptions());
    return { ...query, organizations: query.data ?? [] };
};

export const useOrganizationsQueryUtils = () =>
    useQueryUtils<Organization[]>([...ORGANIZATIONS_QUERY_KEY]);
