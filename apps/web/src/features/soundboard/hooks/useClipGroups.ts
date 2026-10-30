import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import {
    SOUNDBOARD_DEFAULT_GROUP_LABEL,
    SOUNDBOARD_ORGANIZATION_FALLBACK_LABEL,
} from "../consts/groups";
import { SoundboardQueries } from "../queries";
import type { ClipGroup } from "../types/row";
import { useSoundboardLibrary } from "./useSoundboardLibrary";

type Query = ReturnType<typeof SoundboardQueries.useClips>;

const toGroup = (
    query: Query,
    scope: ClipGroup["scope"],
    label: string
): ClipGroup => ({
    scope,
    label,
    clips: query.clips,
    isLoading: query.isPending,
    // A failure with clips on screen is a failed next page, not an empty group.
    isError: query.isError && query.clips.length === 0,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isNextPageError: query.isFetchNextPageError,
    fetchNextPage: () => void query.fetchNextPage(),
    refetch: () => void query.refetch(),
});

/**
 * The groups of the list, each with its own paged query for the same search.
 * The library says which ones there are: an organization has its own clips,
 * named after it, and the default ones, and the admin only the default ones.
 * A group the library does not have is not fetched.
 */
export const useClipGroups = (search: string): ClipGroup[] => {
    const { scopes } = useSoundboardLibrary();
    const organizationName =
        useOrganization().organization?.name ??
        SOUNDBOARD_ORGANIZATION_FALLBACK_LABEL;
    const organizationClips = SoundboardQueries.useClips({
        scope: SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
        search,
        enabled: scopes.includes(SOUNDBOARD_CLIP_SCOPES.ORGANIZATION),
    });
    const defaultClips = SoundboardQueries.useClips({
        scope: SOUNDBOARD_CLIP_SCOPES.DEFAULT,
        search,
        enabled: scopes.includes(SOUNDBOARD_CLIP_SCOPES.DEFAULT),
    });

    const groups: ClipGroup[] = [
        toGroup(
            organizationClips,
            SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
            organizationName
        ),
        toGroup(
            defaultClips,
            SOUNDBOARD_CLIP_SCOPES.DEFAULT,
            SOUNDBOARD_DEFAULT_GROUP_LABEL
        ),
    ];
    return groups.filter((group) => scopes.includes(group.scope));
};
