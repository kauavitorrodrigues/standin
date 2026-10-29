import { MEDIA_PAUSE_REASONS, type UserSummary } from "@standin/contracts";
import type { RemoteVideo } from "@/features/game/multiplayer/types/remoteVideo";
import type { StageTile } from "@/features/spaces/types/stage";

export const buildNameLookup = (
    participants: readonly UserSummary[]
): Map<string, string> =>
    new Map(
        participants.map((participant) => [participant.id, participant.name])
    );

const labelFor = (name: string, slot: StageTile["slot"]): string =>
    slot === "screen" ? `${name} (tela)` : name;

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
    // Users whose mic is off, ourselves included.
    mutedUserIds?: ReadonlySet<string>;
    // Users speaking right now. They sort ahead of the other people.
    speakingUserIds?: ReadonlySet<string>;
    // Users whose video the viewer hid. They have no video, so they show as
    // an avatar that says so.
    hiddenUserIds?: ReadonlySet<string>;
};

const nameOf = (
    userId: string | null,
    names: ReadonlyMap<string, string>
): string =>
    (userId ? names.get(userId) : undefined) ??
    "Alguém";

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
    mutedUserIds = new Set(),
    speakingUserIds = new Set(),
    hiddenUserIds = new Set(),
}: BuildStageTilesInput): StageTile[] => {
    const tiles: StageTile[] = [];

    if (localScreenStream) {
        tiles.push({
            id: "self:screen",
            slot: "screen",
            stream: localScreenStream,
            userId: selfUserId,
            label: labelFor("Você", "screen"),
            isSelf: true,
            isMuted: false,
            notice: null,
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
            isMuted:
                video.slot === "camera" &&
                video.userId !== null &&
                mutedUserIds.has(video.userId),
            notice: video.pauseReason,
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
                isMuted: mutedUserIds.has(userId),
                notice: hiddenUserIds.has(userId)
                    ? MEDIA_PAUSE_REASONS.USER_HIDDEN
                    : null,
            });
        });

    if (includeSelf) {
        tiles.push({
            id: "self:camera",
            slot: "camera",
            stream: localCameraStream,
            userId: selfUserId,
            label: "Você",
            isSelf: true,
            isMuted: mutedUserIds.has(selfUserId),
            notice: null,
        });
    }

    // `nearbyUserIds` arrives nearest first, so the position in it is the
    // distance rank. Anyone not in it (a screen from further away) goes last
    // within their group.
    const distanceRank = new Map<string, number>();
    nearbyUserIds.forEach((userId, index) => {
        if (!distanceRank.has(userId)) distanceRank.set(userId, index);
    });

    return tiles.sort((first, second) =>
        compareByRelevance(first, second, distanceRank, speakingUserIds)
    );
};

// The carousel is ordered by relevance:
// screens first, then people speaking now, then the nearest, and ourselves
// last. A person's camera and screen are separate tiles. Ties keep their
// order because Array.sort is stable.
const compareByRelevance = (
    first: StageTile,
    second: StageTile,
    distanceRank: ReadonlyMap<string, number>,
    speakingUserIds: ReadonlySet<string>
): number => {
    const groupDifference = groupOf(first) - groupOf(second);
    if (groupDifference !== 0) return groupDifference;

    const isSpeaking = (tile: StageTile): number =>
        Number(tile.userId !== null && speakingUserIds.has(tile.userId));
    // Screens carry no audio, so speaking only orders people.
    const speakingDifference =
        first.slot === "screen" ? 0 : isSpeaking(second) - isSpeaking(first);
    if (speakingDifference !== 0) return speakingDifference;

    const rankOf = (tile: StageTile): number =>
        (tile.userId ? distanceRank.get(tile.userId) : undefined) ??
        Number.POSITIVE_INFINITY;
    const firstRank = rankOf(first);
    const secondRank = rankOf(second);
    if (firstRank === secondRank) return 0;
    return firstRank < secondRank ? -1 : 1;
};

// 0 screens, 1 other people, 2 ourselves.
const groupOf = (tile: StageTile): number => {
    if (tile.slot === "screen") return 0;
    return tile.isSelf ? 2 : 1;
};
