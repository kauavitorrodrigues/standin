import type { RemoteVideo } from "../types/remoteVideo";

export type RemoteVideoIdentity = {
    id: string;
    stream: MediaStream | null;
    pauseReason?: RemoteVideo["pauseReason"];
};

/**
 * True when two lists show the same videos. Used to skip a React state update
 * when a repeated announcement resolved to what is already being shown.
 */
export const areRemoteVideosEqual = (
    first: readonly RemoteVideoIdentity[],
    second: readonly RemoteVideoIdentity[]
): boolean =>
    first.length === second.length &&
    first.every(
        (video, index) =>
            video.id === second[index].id &&
            video.stream === second[index].stream &&
            (video.pauseReason ?? null) === (second[index].pauseReason ?? null)
    );

export type RemoteVideoEntry = Pick<RemoteVideo, "userId" | "slot"> & {
    track: MediaStreamTrack;
    pauseReason?: RemoteVideo["pauseReason"];
};

/** A camera and a screen are the only video sources a person sends. */
export const slotOfSource = (source: string): RemoteVideo["slot"] =>
    source === "screen" ? "screen" : "camera";

/**
 * One entry per person and slot. When the server replaces a consumer, the
 * newest one wins.
 */
export const dedupeEntries = (
    entries: Iterable<[string, RemoteVideoEntry]>
): RemoteVideoEntry[] => {
    const byId = new Map<string, RemoteVideoEntry>();
    for (const [, entry] of entries) {
        byId.set(`${entry.userId}:${entry.slot}`, entry);
    }
    return [...byId.values()];
};
