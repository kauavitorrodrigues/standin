import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import type {
    LibraryFamilyList,
    LibraryFamilyQuerySchemaType,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

export const LIBRARY_FAMILIES_QUERY_KEY = "libraryFamilies";

const PAGE_SIZE = 24;

// What the screen asks for. The server searches, filters and sorts, and
// answers page by page with the cards already built. The page is driven by
// the scroll, so it is not part of the params.
export type LibraryFamiliesParams = Partial<
    Omit<LibraryFamilyQuerySchemaType, "inUse" | "page" | "pageSize">
> & { inUse?: boolean };

export const useLibraryFamilies = (
    params: LibraryFamiliesParams,
    enabled = true
) => {
    const { apiBase, key } = useLibraryScope();
    const query = useInfiniteQuery({
        enabled,
        queryKey: [LIBRARY_FAMILIES_QUERY_KEY, key, params],
        queryFn: async ({ pageParam }): Promise<LibraryFamilyList> => {
            const res = await api.get(`${apiBase}/assets`, {
                params: { ...params, page: pageParam, pageSize: PAGE_SIZE },
            });
            return res.data;
        },
        initialPageParam: 1,
        placeholderData: keepPreviousData,
        getNextPageParam: ({ page, totalPages }) =>
            page < totalPages ? page + 1 : undefined,
    });

    const families = query.data?.pages.flatMap((page) => page.families) ?? [];
    const total = query.data?.pages[0]?.total ?? 0;

    return { ...query, families, total };
};
