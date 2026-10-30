import { SOUNDBOARD_DEFAULT_PAGE_SIZE } from "@standin/contracts";
import type { ClipListFilters } from "../types/clip";
import type { SoundboardLibraryKind } from "../types/library";

type Filters = Pick<ClipListFilters, "scope" | "search">;

/**
 * The query of a list. The organization asks for one scope at a time, since
 * its route returns both. The admin route has only the default clips, so it
 * has no scope to ask for.
 */
export const buildListParams = (
    kind: SoundboardLibraryKind,
    { scope, search }: Filters,
    page: number
) => ({
    scope: kind === "admin" ? undefined : scope,
    search: search || undefined,
    page,
    pageSize: SOUNDBOARD_DEFAULT_PAGE_SIZE,
});
