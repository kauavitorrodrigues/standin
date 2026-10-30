import { GLOBAL_LIBRARY_CACHE_KEY } from "../consts/library";
import { SOUNDBOARD_CLIPS_QUERY_KEY } from "../consts/queryKeys";
import type { ClipListFilters } from "../types/clip";
import type { ClipListSource } from "../types/library";

/** What tells one library from another in the cache: the organization, or the global one. */
export const buildLibraryCacheKey = ({
    kind,
    organizationId,
}: ClipListSource): string => {
    if (kind === "admin") return GLOBAL_LIBRARY_CACHE_KEY;
    return organizationId;
};

/**
 * The key of one list. The library is in it, so the default clips the admin
 * lists (which it may manage) never share a cache with the ones an
 * organization lists (which it may not).
 */
export const buildClipsQueryKey = (
    source: ClipListSource,
    { scope, search }: Pick<ClipListFilters, "scope" | "search">
) => [SOUNDBOARD_CLIPS_QUERY_KEY, buildLibraryCacheKey(source), scope, search];
