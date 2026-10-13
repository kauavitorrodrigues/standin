import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryFamilyDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const LIBRARY_FAMILY_QUERY_KEY = "libraryFamily";

// The whole family of a base asset: the base and every variation.
export const libraryFamilyQueryOptions = (familyId: string) =>
    queryOptions({
        queryKey: [LIBRARY_FAMILY_QUERY_KEY, familyId],
        queryFn: async (): Promise<LibraryFamilyDetail> => {
            const res = await api.get(`/library/assets/${familyId}`);
            return res.data.family;
        },
        enabled: !!familyId,
    });

export const useLibraryFamily = (familyId: string) =>
    useQuery(libraryFamilyQueryOptions(familyId));
