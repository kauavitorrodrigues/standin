import { TILE_SIZE } from "@standin/contracts";

// How far the avatar has to walk before it counts as having moved around, in
// px. A tap on a key or a nudge is not enough.
export const TRAVEL_MIN_DISTANCE_PX = TILE_SIZE * 3;

// A jump larger than this in one frame is a teleport or a snap to a seat, not
// walking, and adds nothing to the distance.
export const TRAVEL_MAX_STEP_PX = TILE_SIZE * 2;

// Emitted once on `game.events` when the avatar has walked that far.
export const TRAVEL_EVENTS = {
    TRAVELED: "player:traveled",
    // The avatar walked into a common area, after it had walked around.
    AREA_ENTERED: "player:area-entered",
} as const;
