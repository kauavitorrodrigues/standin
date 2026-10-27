import { MAX_PINNED_VIDEOS } from "@/features/spaces/consts/stage";
import type { StageTile } from "@/features/spaces/types/stage";
import type { PinnedVideo } from "@/features/spaces/types/pinnedVideos";

// Pins a video: an inactive
// or already pinned video is ignored. At the cap the entry with the oldest
// pinnedAt is dropped (FIFO) before the new one is pushed.
export const addPinnedVideo = (
    pinned: readonly PinnedVideo[],
    tileId: string,
    isActive: boolean,
    now: number
): readonly PinnedVideo[] => {
    if (!isActive || pinned.some((entry) => entry.tileId === tileId))
        return pinned;

    let next = [...pinned];
    if (next.length >= MAX_PINNED_VIDEOS) {
        const [oldest] = [...next].sort(
            (first, second) => first.pinnedAt - second.pinnedAt
        );
        next = next.filter((entry) => entry !== oldest);
    }
    next.push({ tileId, pinnedAt: now });
    return next;
};

export const removePinnedVideo = (
    pinned: readonly PinnedVideo[],
    tileId: string
): readonly PinnedVideo[] => pinned.filter((entry) => entry.tileId !== tileId);

/**
 * The remote people behind the pinned tiles, in pin order, without repeats.
 * The own tiles are left out because the server never sends the own media
 * back.
 */
export const pinnedRemoteUserIds = (
    tiles: readonly StageTile[],
    pinnedIds: readonly string[]
): string[] => {
    const userIds: string[] = [];
    pinnedIds.forEach((tileId) => {
        const tile = tiles.find((candidate) => candidate.id === tileId);
        if (!tile || tile.isSelf || tile.userId === null) return;
        if (!userIds.includes(tile.userId)) userIds.push(tile.userId);
    });
    return userIds;
};
