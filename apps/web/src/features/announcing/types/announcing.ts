import type { SpaceAnnouncer } from "@standin/contracts";

export type AnnouncingState = {
    // The people near me who announce, exactly as the server sent them. The
    // server decides who is within earshot and the order, the client only
    // shows it.
    announcers: SpaceAnnouncer[];
    // When my own announcement started, null while I am not announcing.
    announcingSince: number | null;
};

export type AnnouncingAction =
    | { type: "announcers-received"; announcers: SpaceAnnouncer[] }
    | { type: "own-state-set"; announcingSince: number | null }
    | { type: "reset" };

export type AnnounceDisabledReason = "mic-muted";

// The wordings of the start button: ready to start, or one reason it cannot.
export type AnnounceStartLabelKey = AnnounceDisabledReason | "ready";

export type AnnouncingRequestKind = "start" | "stop";

export type AutoStopInput = {
    isMicEnabled: boolean;
    isAnnouncing: boolean;
    isRequestPending: boolean;
};

export type SpaceAnnouncing = {
    announcers: SpaceAnnouncer[];
    isAnnouncing: boolean;
    // Why announcing cannot start now, null when it can.
    disabledReason: AnnounceDisabledReason | null;
    start: () => void;
    stop: () => void;
};

export type UseAnnouncingOptions = {
    isMicEnabled: boolean;
};
