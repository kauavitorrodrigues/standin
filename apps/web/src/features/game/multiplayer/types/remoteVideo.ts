import type { RemoteVideoSlot } from "@/features/game/multiplayer/utils/remoteVideo";

export type RemoteVideo = {
    // `${socketId}:${slot}`, stable while that peer keeps sending that slot.
    id: string;
    socketId: string;
    userId: string | null;
    slot: RemoteVideoSlot;
    stream: MediaStream;
};
