import type { MediaKind, MediaSource } from "@standin/contracts";

export type SfuSource = MediaSource;

/** A stream the server created for this person, ready to play. */
export type SfuRemoteTrack = {
    consumerId: string;
    userId: string;
    source: SfuSource;
    kind: MediaKind;
    track: MediaStreamTrack;
};

/** What the media client tells its owner. */
export type SfuEvents = {
    onRemoteTrack: (remote: SfuRemoteTrack) => void;
    onRemoteTrackClosed: (consumerId: string) => void;
    // Every remote track went away at once, because the session is being
    // rebuilt. Optional for owners that do not care.
    onRemoteTrackClosedAll?: () => void;
    // The transport failed or stayed disconnected past the grace period. The
    // owner builds the session again.
    onBroken: () => void;
};
