// Emitted on `game.events` when the desk under the mouse changes, and while
// the camera moves under a hovered desk. The payload is a DeskHover or null.
export const DESK_EVENTS = {
    HOVER_CHANGED: "desk:hover-changed",
} as const;
