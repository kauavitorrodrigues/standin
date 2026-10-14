import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryFamilyDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { LibraryScope } from "@/features/library/types/LibraryScope";

export const LIBRARY_FAMILY_QUERY_KEY = "libraryFamily";

// The whole family of a base asset: the base and every variation.
export const libraryFamilyQueryOptions = (
    scope: LibraryScope,
    familyId: string
) =>
    queryOptions({
        queryKey: [LIBRARY_FAMILY_QUERY_KEY, scope.key, familyId],
        queryFn: async (): Promise<LibraryFamilyDetail> => {
            const res = await api.get(`${scope.apiBase}/assets/${familyId}`);
            return res.data.family;
        },
        enabled: !!familyId,
    });

export const useLibraryFamily = (familyId: string) => {
    const scope = useLibraryScope();
    return useQuery(libraryFamilyQueryOptions(scope, familyId));
};
