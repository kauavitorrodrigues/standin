import type { RemoteVideoSlot } from "@/features/game/multiplayer/utils/remoteVideo";

export type RemoteVideo = {
    // `${socketId}:${slot}`, stable while that peer keeps sending that slot.
    id: string;
    socketId: string;
    userId: string | null;
    slot: RemoteVideoSlot;
    // `null` while the video is off the stage page: the track is kept but
    // nothing is attached to it, so nothing gets decoded.
    stream: MediaStream | null;
};
