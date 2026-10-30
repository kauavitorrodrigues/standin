import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClip, SoundboardClipScope } from "@standin/contracts";
import type { ClipGroup } from "../../types/row";

export const makeClip = (id: string): SoundboardClip => ({
    id,
    name: `Clip ${id}`,
    icon: null,
    volume: 1,
    durationMs: 1000,
    scope: SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
    fileUrl: `/files/${id}`,
    createdByName: "Someone",
    canManage: false,
    updatedAt: 0,
});

export const makeClips = (count: number, prefix = "c"): SoundboardClip[] =>
    Array.from({ length: count }, (_, index) => makeClip(`${prefix}${index}`));

export const makeGroup = (
    scope: SoundboardClipScope,
    overrides: Partial<ClipGroup> = {}
): ClipGroup => ({
    scope,
    label: scope,
    clips: [],
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    isNextPageError: false,
    fetchNextPage: () => undefined,
    refetch: () => undefined,
    ...overrides,
});
