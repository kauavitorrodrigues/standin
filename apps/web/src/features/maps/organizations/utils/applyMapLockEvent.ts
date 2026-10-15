import type { MapLockState, MapUnlockedPayload } from "@standin/contracts";
import type { MapLockEvent } from "../types/mapLockEvent";

// Next lock state after a socket event. Events of other maps leave the
// current state untouched. An unlock of the decorator does not free a map the
// Studio now holds (the two events of the Studio taking over can arrive in
// either order), so an unlock only frees the mode it names.
const isOtherMode = (
    current: MapLockState,
    mode: MapUnlockedPayload["mode"]
): boolean =>
    current.locked &&
    current.mode !== undefined &&
    mode !== undefined &&
    current.mode !== mode;

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
                mode: event.payload.mode,
            };
        case "unlocked":
            if (isOtherMode(current, event.payload.mode)) return current;
            return { locked: false };
    }
};
