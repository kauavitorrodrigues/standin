import type { MediaPauseReason } from "@standin/contracts";

export type RemoteVideoSlot = "camera" | "screen";

export type RemoteVideo = {
    // `${userId}:${slot}`, stable while that person keeps sending that slot.
    id: string;
    userId: string;
    slot: RemoteVideoSlot;
    // `null` while the video is off the stage page: the track is kept but
    // nothing is attached to it, so nothing gets decoded.
    stream: MediaStream | null;
    // Why the server holds this video back, null while it plays. The picture
    // would freeze, so the tile says why instead.
    pauseReason: MediaPauseReason | null;
};
