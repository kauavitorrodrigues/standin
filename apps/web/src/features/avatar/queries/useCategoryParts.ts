import {
    infiniteQueryOptions,
    skipToken,
    useInfiniteQuery,
} from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { AvatarSlot } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_CATEGORY_PARTS_QUERY_KEY } from "../consts/editor/queryKeys";
import type { AvatarCategoryPartsPage } from "../types/editor";
import { buildCategoryPartsPath } from "../utils/buildCategoryPartsPath";
import { resolveCategoryPartsPageUrls } from "../utils/resolveAvatarUrls";

type PageParam = string | undefined;

export const resolvePages = (
    data: InfiniteData<AvatarCategoryPartsPage, PageParam>
): InfiniteData<AvatarCategoryPartsPage, PageParam> => ({
    ...data,
    pages: data.pages.map(resolveCategoryPartsPageUrls),
});

const fetchCategoryPartsPage =
    (slot: AvatarSlot) =>
        async (context: {
        pageParam: PageParam;
    }): Promise<AvatarCategoryPartsPage> => {
            const res = await api.get(buildCategoryPartsPath(slot), {
                params: { cursor: context.pageParam },
            });
            return res.data;
        };

// The options of the parts of one category. The editor list and the random
// avatar read the same cache entry, so a page is fetched once.
export const categoryPartsInfiniteOptions = (slot: AvatarSlot | null) =>
    infiniteQueryOptions({
        queryKey: [AVATAR_CATEGORY_PARTS_QUERY_KEY, slot],
        queryFn: slot === null ? skipToken : fetchCategoryPartsPage(slot),
        initialPageParam: undefined as PageParam,
        getNextPageParam: (lastPage: AvatarCategoryPartsPage) =>
            lastPage.nextCursor ?? undefined,
    });

// The parts of one category, a page at a time by cursor. Nothing is fetched
// while `slot` is null. Each slot has its own cache entry, so going back to a
// category that was already open is instant. The server groups the colors of
// a part, so each item is a family with its `variations`.
export const useCategoryParts = (slot: AvatarSlot | null) => {
    const query = useInfiniteQuery({
        ...categoryPartsInfiniteOptions(slot),
        select: resolvePages,
    });

    const items = query.data?.pages.flatMap((page) => page.items) ?? [];

    return { ...query, items };
};
