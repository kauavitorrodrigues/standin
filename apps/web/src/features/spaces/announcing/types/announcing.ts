import type { SpaceAnnouncer } from "@standin/contracts";

export type AnnouncingState = {
    // The people near me who announce, exactly as the server sent them. The
    // server decides who is within earshot and the order, the client only
    // shows it.
    announcers: SpaceAnnouncer[];
    // When my own announcement started, null while I am not announcing.
    announcingSince: number | null;
    // When I started showing my camera to the announcers near me, null while I
    // do not. The server ends it when nobody announces near me anymore.
    sharingVideoSince: number | null;
};

export type AnnouncingAction =
    | { type: "announcers-received"; announcers: SpaceAnnouncer[] }
    | { type: "own-state-set"; announcingSince: number | null }
    | { type: "video-sharing-set"; sharingVideoSince: number | null }
    | { type: "reset" };

export type AnnounceDisabledReason = "mic-muted";

// The wordings of the start button: ready to start, or one reason it cannot.
export type AnnounceStartLabelKey = AnnounceDisabledReason | "ready";

export type AnnouncingRequestKind = "start" | "stop";

export type VideoSharingKind = "start" | "stop";

export type AutoStopInput = {
    isMicEnabled: boolean;
    isAnnouncing: boolean;
    isRequestPending: boolean;
};

export type VideoSharingAutoStopInput = {
    isCameraEnabled: boolean;
    isSharingVideo: boolean;
    isRequestPending: boolean;
};

export type SpaceAnnouncing = {
    announcers: SpaceAnnouncer[];
    isAnnouncing: boolean;
    // Whether I show my camera to the announcers near me.
    isSharingVideo: boolean;
    // Why announcing cannot start now, null when it can.
    disabledReason: AnnounceDisabledReason | null;
    start: () => void;
    stop: () => void;
    // Whether my camera is on, the only time there is something to share.
    canShareVideo: boolean;
    // Starts or stops showing my camera to the announcers near me.
    toggleVideoSharing: () => void;
};

export type UseAnnouncingOptions = {
    isMicEnabled: boolean;
    // Whether the camera is on and sending, not only the toggle.
    isCameraEnabled: boolean;
};
