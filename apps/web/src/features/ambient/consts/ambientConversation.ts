// Emitted on `game.events` when the mouse is on a person whose conversation
// is overheard, and while the camera moves under it. The payload is a
// HoverState or null.
export const AMBIENT_EVENTS = {
    HOVER_CHANGED: "ambient:hover-changed",
} as const;

// How long the avatar of a person stays highlighted after their conversation
// is first overheard.
export const AMBIENT_HIGHLIGHT_MS = 2000;

// A person stays overheard this long after they last spoke, so a pause in a
// sentence neither hides the tooltip nor starts the highlight again. A
// conversation counts as started only after a quiet period longer than this.
export const AMBIENT_GRACE_MS = 3000;

export const AMBIENT_CONVERSATION_LABEL = "Conversa por perto";
