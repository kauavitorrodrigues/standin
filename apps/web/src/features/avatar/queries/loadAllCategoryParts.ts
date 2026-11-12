import type { QueryClient } from "@tanstack/react-query";
import type { AvatarSlot } from "@standin/contracts";
import { RANDOM_MAX_PAGES } from "../consts/editor/random";
import type { AvatarCategoryPartItem } from "../types/editor";
import { resolveCategoryPartsPageUrls } from "../utils/resolveAvatarUrls";
import { categoryPartsInfiniteOptions } from "./useCategoryParts";

const hasMorePages = (
    data: { pages: readonly { nextCursor: string | null }[] } | undefined
) => {
    const last = data?.pages.at(-1);
    return last !== undefined && Boolean(last.nextCursor);
};

// Every part of one category, following the cursor page by page. It reads and
// writes the same cache entry as the editor list. A list that was already
// walked to its end costs nothing; otherwise the first draw fetches the pages
// one after the other (the list is fetched again from its first page) and
// the next ones come from the cache. Because the entry then holds up to
// `RANDOM_MAX_PAGES` pages, any later refetch or invalidation of that list
// refetches all of them in sequence.
export const loadAllCategoryParts = async (
    queryClient: QueryClient,
    slot: AvatarSlot
): Promise<AvatarCategoryPartItem[]> => {
    const options = categoryPartsInfiniteOptions(slot);
    const cached = queryClient.getQueryData(options.queryKey);
    const isComplete = cached !== undefined && !hasMorePages(cached);

    // staleTime 0: the app keeps lists fresh for minutes, and a fresh entry
    // would ignore `pages` and return only what it holds.
    const fetchPages = () =>
        queryClient.fetchInfiniteQuery({
            ...options,
            pages: RANDOM_MAX_PAGES,
            staleTime: 0,
        });

    let data = cached && isComplete ? cached : await fetchPages();
    // A fetch of the list already in flight (page 1 of the editor) is shared
    // with this call and ends with its own pages. It is over now, so one more
    // call walks the rest.
    if (hasMorePages(data) && data.pages.length < RANDOM_MAX_PAGES) {
        data = await fetchPages();
    }

    return data.pages.flatMap(
        (page) => resolveCategoryPartsPageUrls(page).items
    );
};
