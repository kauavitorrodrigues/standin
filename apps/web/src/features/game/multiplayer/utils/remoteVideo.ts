import type { PeerMediaStatePayload } from "@standin/contracts";

export type RemoteVideoSlot = "camera" | "screen";

export type RemoteMediaState = Pick<
    PeerMediaStatePayload,
    "cameraStreamId" | "screenStreamId"
>;

export const NO_REMOTE_MEDIA_STATE: RemoteMediaState = {
    cameraStreamId: null,
    screenStreamId: null,
};

export type ResolvedVideoTracks = Record<
    RemoteVideoSlot,
    MediaStreamTrack | null
>;

// Both camera and screen reach the receiver as plain video tracks. What
// tells them apart is the id of the stream the sender attached each one to,
// announced separately in MEDIA_STATE. A track only counts as live when the
// sender currently announces its stream id AND the track itself has
// arrived, in whichever order those two things happened.
export const resolveVideoTracks = (
    tracksByStreamId: ReadonlyMap<string, MediaStreamTrack>,
    state: RemoteMediaState
): ResolvedVideoTracks => {
    const find = (streamId: string | null): MediaStreamTrack | null => {
        if (!streamId) return null;

        const track = tracksByStreamId.get(streamId);
        return track && track.readyState !== "ended" ? track : null;
    };

    return {
        camera: find(state.cameraStreamId),
        screen: find(state.screenStreamId),
    };
};

export type RemoteVideoIdentity = {
    id: string;
    stream: MediaStream;
};

// Used to skip a React state update when a proximity tick or a repeated
// announcement resolved to exactly what is already being shown.
export const areRemoteVideosEqual = (
    first: readonly RemoteVideoIdentity[],
    second: readonly RemoteVideoIdentity[]
): boolean =>
    first.length === second.length &&
    first.every(
        (video, index) =>
            video.id === second[index].id &&
            video.stream === second[index].stream
    );
