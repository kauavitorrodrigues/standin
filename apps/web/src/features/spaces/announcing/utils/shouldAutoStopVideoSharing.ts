import type { VideoSharingAutoStopInput } from "../types/announcing";

// Turning the camera off ends the sharing, so turning it on again does not
// show it to an announcer without a new choice. A request still in flight is
// waited for, so the stop does not cross it.
export const shouldAutoStopVideoSharing = ({
    isCameraEnabled,
    isSharingVideo,
    isRequestPending,
}: VideoSharingAutoStopInput): boolean =>
    !isCameraEnabled && isSharingVideo && !isRequestPending;
