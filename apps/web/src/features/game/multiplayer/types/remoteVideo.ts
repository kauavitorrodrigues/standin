export type RemoteVideoSlot = "camera" | "screen";

export type RemoteVideo = {
    // `${userId}:${slot}`, stable while that person keeps sending that slot.
    id: string;
    userId: string;
    slot: RemoteVideoSlot;
    // `null` while the video is off the stage page: the track is kept but
    // nothing is attached to it, so nothing gets decoded.
    stream: MediaStream | null;
};
