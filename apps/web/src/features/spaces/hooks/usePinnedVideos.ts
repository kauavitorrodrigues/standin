import { useCallback, useMemo, useState } from "react";
import type { PinnedVideo } from "@/features/spaces/types/pinnedVideos";
import type { StageTile } from "@/features/spaces/types/stage";
import {
    addPinnedVideo,
    removePinnedVideo,
} from "@/features/spaces/utils/pinnedVideos";

// The pinned videos of the stage. A pin whose tile is gone is not reported,
// so it cannot hold a slot for something that is no longer on the stage.
export const usePinnedVideos = (tiles: readonly StageTile[]) => {
    const [pinned, setPinned] = useState<readonly PinnedVideo[]>([]);
    const activeKey = tiles.map((tile) => tile.id).join("|");

    const pinnedIds = useMemo(() => {
        const active = new Set(activeKey.split("|"));
        return pinned
            .filter((entry) => active.has(entry.tileId))
            .sort((first, second) => first.pinnedAt - second.pinnedAt)
            .map((entry) => entry.tileId);
    }, [pinned, activeKey]);

    const pin = useCallback(
        (tileId: string) => {
            const isActive = activeKey.split("|").includes(tileId);
            setPinned((current) =>
                addPinnedVideo(current, tileId, isActive, Date.now())
            );
        },
        [activeKey]
    );
    const unpin = useCallback(
        (tileId: string) =>
            setPinned((current) => removePinnedVideo(current, tileId)),
        []
    );

    const togglePin = useCallback(
        (tileId: string) => {
            if (pinnedIds.includes(tileId)) unpin(tileId);
            else pin(tileId);
        },
        [pinnedIds, pin, unpin]
    );

    return { pinnedIds, pin, unpin, togglePin };
};
