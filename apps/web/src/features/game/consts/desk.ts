import { TILE_SIZE } from "@standin/contracts";

// Emitted on `game.events` when the desk under the mouse changes, and while
// the camera moves under a hovered desk. The payload is a DeskHover or null.
export const DESK_EVENTS = {
    HOVER_CHANGED: "desk:hover-changed",
    // The payload is true while the avatar is at its own desk, and false when
    // it is not or has no desk.
    AT_OWN_DESK_CHANGED: "desk:at-own-desk-changed",
} as const;

// How far from the desk the avatar still counts as at it, in px. A tile is
// enough for the chair next to it.
export const DESK_REACH_PX = TILE_SIZE;
