import { TILE_SIZE } from "@standin/contracts";

// Emitted on `game.events` when the object with an embedded website under the
// mouse changes, and while the camera moves under it. The payload is a
// HoverState or null.
export const WEBSITE_EVENTS = {
    HOVER_CHANGED: "website:hover-changed",
    // Emitted when the set of website objects the avatar is within reach of
    // changes. The payload is the ids of those objects, sorted.
    IN_REACH_CHANGED: "website:in-reach-changed",
} as const;

// How far from the sprite of the object the avatar still counts as at it, in
// px. A tile is enough for the spot next to it, as with a desk.
export const WEBSITE_REACH_PX = TILE_SIZE;
