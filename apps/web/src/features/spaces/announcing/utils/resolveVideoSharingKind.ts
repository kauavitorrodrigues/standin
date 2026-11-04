import type { VideoSharingKind } from "../types/announcing";

// The wording of the request that turns the sharing on or off.
export const resolveVideoSharingKind = (wanted: boolean): VideoSharingKind => {
    if (wanted) return "start";
    return "stop";
};
