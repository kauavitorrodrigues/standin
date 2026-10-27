import { MAX_PINNED_VIDEOS } from "@/features/spaces/consts/stage";
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
