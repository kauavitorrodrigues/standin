import type { MediaPauseReason } from "@standin/contracts";
import type { RemoteVideoSlot } from "@/features/game/multiplayer/types/remoteVideo";

export type StageTile = {
    id: string;
    slot: RemoteVideoSlot;
    // `null` is a person who is nearby but has no camera on: the tile shows
    // their avatar instead of video.
    stream: MediaStream | null;
    userId: string | null;
    label: string;
    isSelf: boolean;
    // Their mic is off. Always false for screens, which carry no audio.
    isMuted: boolean;
    // Why the video of this tile is not playing, null while it does. Held back
    // by the server, hidden by the viewer, or lowered by a rule of the space.
    notice: MediaPauseReason | null;
};

// One page of the stage carousel. `carouselIndex` is zero based and always
// within `pageCount`.
export type StageCarousel = {
    carouselIndex: number;
    pageCount: number;
    visible: StageTile[];
    // Tiles that are not on the current page.
    hiddenCount: number;
};
