import { useInfiniteQuery } from "@tanstack/react-query";
import type { SoundboardClip } from "@standin/contracts";
import { useQueryUtils } from "@/lib/tanstack/useQueryUtils";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { SOUNDBOARD_CLIPS_QUERY_KEY } from "../consts/queryKeys";
import { useSoundboardLibrary } from "../hooks/useSoundboardLibrary";
import {
    buildClipsQueryKey,
    buildLibraryCacheKey,
} from "../utils/buildClipsQueryKey";
import { canFetchLibrary } from "../utils/canFetchLibrary";
import { fetchClipPage } from "../lib/fetchClipPage";
import type { ClipListFilters } from "../types/clip";

const FIRST_PAGE = 1;

/**
 * One section of the panel, a page at a time, so a large library never
 * renders all at once.
 */
export const useClips = ({
    scope,
    search,
    enabled = true,
}: ClipListFilters) => {
    const organizationId = useOrganizationId();
    const { kind } = useSoundboardLibrary();
    const source = { kind, organizationId };

    const query = useInfiniteQuery({
        queryKey: buildClipsQueryKey(source, { scope, search }),
        initialPageParam: FIRST_PAGE,
        queryFn: ({ pageParam }) =>
            fetchClipPage(source, { scope, search }, pageParam),
        getNextPageParam: (last, pages) => {
            const loaded = pages.reduce(
                (sum, page) => sum + page.clips.length,
                0
            );
            return loaded < last.total ? last.page + 1 : undefined;
        },
        enabled: canFetchLibrary(source) && enabled,
    });

    const clips: SoundboardClip[] =
        query.data?.pages.flatMap((page) => page.clips) ?? [];
    const total = query.data?.pages[0]?.total ?? 0;

    return { ...query, clips, total };
};

export const useClipsQueryUtils = () => {
    const organizationId = useOrganizationId();
    const { kind } = useSoundboardLibrary();
    return useQueryUtils([
        SOUNDBOARD_CLIPS_QUERY_KEY,
        buildLibraryCacheKey({ kind, organizationId }),
    ]);
};
