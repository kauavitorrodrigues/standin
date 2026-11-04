import type { AutoStopInput } from "../types/announcing";

// Muting the microphone ends the announcement. A request still in flight is
// waited for, so the stop does not cross it.
export const shouldAutoStopAnnouncing = ({
    isMicEnabled,
    isAnnouncing,
    isRequestPending,
}: AutoStopInput): boolean =>
    !isMicEnabled && isAnnouncing && !isRequestPending;
