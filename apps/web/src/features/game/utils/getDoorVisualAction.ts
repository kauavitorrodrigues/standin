import type { RoomDoorState } from "@standin/contracts";

export type DoorVisualAction =
    "snap-open" | "snap-closed" | "animate-open" | "animate-closed" | "none";

// Closed and locked look the same for the panel, only the padlock differs.
const isOpen = (state: RoomDoorState): boolean => state === "open";

const snapTo = (next: RoomDoorState): DoorVisualAction => {
    switch (next) {
        case "open":
            return "snap-open";
        case "closed":
        case "locked":
            return "snap-closed";
    }
};

const animateTo = (next: RoomDoorState): DoorVisualAction => {
    switch (next) {
        case "open":
            return "animate-open";
        case "closed":
        case "locked":
            return "animate-closed";
    }
};

/**
 * What a door does on screen when its room goes from `previous` to `next`.
 * With no previous state (the first one received) it snaps to the frame
 * without animating. A change between closed and locked moves nothing.
 */
export const getDoorVisualAction = (
    previous: RoomDoorState | undefined,
    next: RoomDoorState
): DoorVisualAction => {
    if (previous === undefined) return snapTo(next);
    if (isOpen(previous) === isOpen(next)) return "none";
    return animateTo(next);
};
