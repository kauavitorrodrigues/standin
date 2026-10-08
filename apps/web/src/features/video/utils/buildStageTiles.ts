import type { UserSummary } from "@standin/contracts";
import { VIDEO_STAGE_LABELS } from "../consts/stage";
import type { RemoteVideo } from "../types/remoteVideo";
import type { StageTile } from "../types/stage";

export const buildNameLookup = (
    participants: readonly UserSummary[]
): Map<string, string> =>
    new Map(
        participants.map((participant) => [participant.id, participant.name])
    );

const labelFor = (name: string, slot: StageTile["slot"]): string =>
    slot === "screen" ? `${name} ${VIDEO_STAGE_LABELS.screenSuffix}` : name;

type BuildStageTilesInput = {
    remoteVideos: readonly RemoteVideo[];
    localCameraStream: MediaStream | null;
    localScreenStream: MediaStream | null;
    names: ReadonlyMap<string, string>;
    // Everyone close enough to us. They all get a tile: their camera when
    // they send one, their avatar otherwise.
    nearbyUserIds: readonly string[];
    selfUserId: string;
    // Whether our own tile (camera or avatar) belongs on the stage. When it
    // does not, it lives in the bottom bar instead.
    includeSelf: boolean;
};

const nameOf = (
    userId: string | null,
    names: ReadonlyMap<string, string>
): string =>
    (userId ? names.get(userId) : undefined) ??
    VIDEO_STAGE_LABELS.unknownPerson;

// Turns everything that can appear on the stage (what peers send to us, who
// is nearby, and what we are sending ourselves) into one flat, render-ready
// list. Screens come first: they are the thing people gather around. Then
// the people nearby, with our own tile last so the others are what you read
// first.
export const buildStageTiles = ({
    remoteVideos,
    localCameraStream,
    localScreenStream,
    names,
    nearbyUserIds,
    selfUserId,
    includeSelf,
}: BuildStageTilesInput): StageTile[] => {
    const tiles: StageTile[] = [];

    if (localScreenStream) {
        tiles.push({
            id: "self:screen",
            slot: "screen",
            stream: localScreenStream,
            userId: selfUserId,
            label: labelFor(VIDEO_STAGE_LABELS.self, "screen"),
            isSelf: true,
        });
    }

    remoteVideos.forEach((video) => {
        tiles.push({
            id: video.id,
            slot: video.slot,
            stream: video.stream,
            userId: video.userId,
            label: labelFor(nameOf(video.userId, names), video.slot),
            isSelf: false,
        });
    });

    const usersWithCamera = new Set(
        remoteVideos
            .filter((video) => video.slot === "camera")
            .map((video) => video.userId)
    );
    // A Set so a user listed twice (two sockets) cannot produce two tiles
    // with the same key.
    [...new Set(nearbyUserIds)]
        .filter((userId) => !usersWithCamera.has(userId))
        .forEach((userId) => {
            tiles.push({
                id: `${userId}:avatar`,
                slot: "camera",
                stream: null,
                userId,
                label: nameOf(userId, names),
                isSelf: false,
            });
        });

    if (includeSelf) {
        tiles.push({
            id: "self:camera",
            slot: "camera",
            stream: localCameraStream,
            userId: selfUserId,
            label: VIDEO_STAGE_LABELS.self,
            isSelf: true,
        });
    }

    return tiles.sort(
        (first, second) =>
            Number(second.slot === "screen") - Number(first.slot === "screen")
    );
};
