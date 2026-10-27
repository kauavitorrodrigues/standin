import { useEffect } from "react";
import type { StageTile } from "@/features/spaces/types/stage";
import { pinnedRemoteUserIds } from "@/features/spaces/utils/pinnedVideos";

type SyncPinnedPeopleOptions = {
    tiles: readonly StageTile[];
    pinnedIds: readonly string[];
    setPins: (userIds: readonly string[]) => void;
};

// Tells the media server who is pinned on the stage, so a pinned person keeps
// a video slot instead of only an avatar. Sent again only when the people
// change, not on every render.
export const useSyncPinnedPeople = ({
    tiles,
    pinnedIds,
    setPins,
}: SyncPinnedPeopleOptions) => {
    const userIds = pinnedRemoteUserIds(tiles, pinnedIds);
    const key = userIds.join("|");

    useEffect(() => {
        setPins(key === "" ? [] : key.split("|"));
    }, [key, setPins]);
};
