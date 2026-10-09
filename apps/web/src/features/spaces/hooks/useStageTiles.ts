import { useMemo } from "react";
import type { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import { OrganizationsQueries } from "@/features/organizations/queries";
import { useMicEnabled } from "@/features/media-devices/hooks/useMicEnabled";
import {
    buildNameLookup,
    buildStageTiles,
} from "@/features/spaces/utils/buildStageTiles";

type StageTilesOptions = {
    video: ReturnType<typeof useSpaceConnection>["video"];
    selfUserId: string;
};

export const useStageTiles = ({ video, selfUserId }: StageTilesOptions) => {
    // Names come from the organization's members, not from the space
    // conversation's participants: that list is a snapshot from when the
    // space was created, so it would not know anyone who joined the
    // organization afterwards.
    const { members } = OrganizationsQueries.useMembers();
    const { screenShare } = video;
    // The stage strip only shows up once someone is nearby (or sending
    // video). Alone, nothing is rendered at the top of the map.
    const isOnStage =
        video.nearbyUserIds.length > 0 || video.remoteVideos.length > 0;
    const isMicEnabled = useMicEnabled();
    const mutedUserIds = useMemo(() => {
        const muted = new Set(video.mutedUserIds);
        if (!isMicEnabled) muted.add(selfUserId);
        return muted;
    }, [video.mutedUserIds, isMicEnabled, selfUserId]);

    return useMemo(
        () =>
            buildStageTiles({
                remoteVideos: video.remoteVideos,
                localCameraStream: video.localCameraStream,
                nearbyUserIds: video.nearbyUserIds,
                selfUserId,
                includeSelf: isOnStage,
                mutedUserIds,
                localScreenStream: screenShare.stream,
                names: buildNameLookup(members),
            }),
        [
            video.remoteVideos,
            video.localCameraStream,
            video.nearbyUserIds,
            selfUserId,
            isOnStage,
            mutedUserIds,
            screenShare.stream,
            members,
        ]
    );
};
