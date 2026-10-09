import { MAX_AUDIBLE_RADIUS } from "../consts/audio";
import {
    CAMERA_ENCODING_BASE,
    CAMERA_ENCODING_FLOOR_BITRATE,
    MAX_VIDEO_PEERS,
    SCREEN_ENCODING_BASE,
    SCREEN_ENCODING_FLOOR_BITRATE,
    VIDEO_ENTER_RADIUS,
    VIDEO_EXIT_RADIUS,
    type VideoEncoding,
} from "../consts/video";

// What the local user is currently allowed to send to one specific peer.
export type PeerMediaPolicy = {
    audio: boolean;
    video: boolean;
};

export const NO_MEDIA: PeerMediaPolicy = { audio: false, video: false };

// Which peers should receive the local video, given each peer's distance.
// * a peer joins when inside VIDEO_ENTER_RADIUS
// * a peer that already receives video stays until beyond VIDEO_EXIT_RADIUS
//   (hysteresis, so the boundary does not flicker)
// * at most maxVideoPeers (never above MAX_VIDEO_PEERS), closest first
export const selectVideoPeers = (
    distances: ReadonlyMap<string, number>,
    currentlyReceiving: ReadonlySet<string>,
    maxVideoPeers: number = MAX_VIDEO_PEERS
): Set<string> => {
    const eligible = [...distances.entries()]
        .filter(([socketId, distance]) =>
            currentlyReceiving.has(socketId)
                ? distance <= VIDEO_EXIT_RADIUS
                : distance <= VIDEO_ENTER_RADIUS
        )
        .sort(([, first], [, second]) => first - second)
        .slice(0, Math.min(maxVideoPeers, MAX_VIDEO_PEERS));

    return new Set(eligible.map(([socketId]) => socketId));
};

// Audio follows the same edge the volume falloff already uses: audible
// exactly when the linear volume would be above zero.
export const getPeerMediaPolicies = (
    distances: ReadonlyMap<string, number>,
    currentlyReceivingVideo: ReadonlySet<string>,
    maxVideoPeers: number = MAX_VIDEO_PEERS
): Map<string, PeerMediaPolicy> => {
    const videoPeers = selectVideoPeers(
        distances,
        currentlyReceivingVideo,
        maxVideoPeers
    );
    const policies = new Map<string, PeerMediaPolicy>();

    distances.forEach((distance, socketId) => {
        policies.set(socketId, {
            audio: distance < MAX_AUDIBLE_RADIUS,
            video: videoPeers.has(socketId),
        });
    });

    return policies;
};

export const getReceivingVideoPeers = (
    policies: ReadonlyMap<string, PeerMediaPolicy>
): Set<string> =>
    new Set(
        [...policies.entries()]
            .filter(([, policy]) => policy.video)
            .map(([socketId]) => socketId)
    );

// Every extra receiver is another upload of the same video in a mesh, so
// the per-receiver budget shrinks as more peers receive it, down to a floor
// below which the picture stops being useful.
export const getVideoEncoding = (
    kind: "camera" | "screen",
    receiverCount: number
): VideoEncoding => {
    const isCamera = kind === "camera";
    const base = isCamera ? CAMERA_ENCODING_BASE : SCREEN_ENCODING_BASE;
    const floor = isCamera
        ? CAMERA_ENCODING_FLOOR_BITRATE
        : SCREEN_ENCODING_FLOOR_BITRATE;
    const receivers = Math.max(1, receiverCount);

    return {
        ...base,
        maxBitrate: Math.max(floor, Math.floor(base.maxBitrate / receivers)),
        scaleResolutionDownBy:
            isCamera && receivers >= 3 ? 1.5 : base.scaleResolutionDownBy,
    };
};
