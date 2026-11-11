import type { ListeningTrack } from "@standin/contracts";

// What the server last decided to show of a person in a space. `visible` is
// null when nothing is shown. `trackId` and `pausedSince` outlive a hidden
// track, so a long pause stays hidden instead of coming back on every poll.
export type ShownState = {
    visible: ListeningTrack | null;
    trackId: string | null;
    pausedSince: number | null;
};

export type ResolveShownInput = {
    track: ListeningTrack | null;
    previous: ShownState | null;
    now: number;
    pauseLimitMs: number;
};

// Kept for one tick, so a person in two spaces and an organization with many
// spaces are read once.
export type TickCaches = {
    tracks: Map<string, Promise<ListeningTrack | null | undefined>>;
    connected: Map<string, Promise<string[]>>;
};
