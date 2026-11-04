import type { AnnounceDisabledReason } from "../types/announcing";

// Announcing is only allowed while the microphone is on, so it never starts
// while muted.
export const resolveAnnounceDisabledReason = (
    isMicEnabled: boolean
): AnnounceDisabledReason | null => {
    if (isMicEnabled) return null;
    return "mic-muted";
};
