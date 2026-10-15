import type { MapLockState } from "@standin/contracts";
import type { MapLockEvent } from "../types/mapLockEvent";

// Next lock state after a socket event. Events of other maps leave the
// current state untouched.
export const applyMapLockEvent = (
    current: MapLockState,
    event: MapLockEvent,
    mapId: string
): MapLockState => {
    if (event.payload.mapId !== mapId) return current;

    switch (event.type) {
        case "locked":
            return {
                locked: true,
                by: event.payload.by,
                since: event.payload.since,
            };
        case "unlocked":
            return { locked: false };
    }
};
