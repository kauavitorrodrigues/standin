import type { NearbyCounter } from "@/features/nearby-chat/types/nearby-chat";

export type NearbyCounterTone = "normal" | "warning" | "error";

// How the counter of the header looks: red when the text cannot be sent, the
// warning color from 40 characters, else the normal one.
export const getNearbyCounterTone = (
    counter: NearbyCounter
): NearbyCounterTone => {
    if (counter.isOverLimit) return "error";
    if (counter.isWarning) return "warning";
    return "normal";
};
