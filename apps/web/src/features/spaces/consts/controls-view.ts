// The view that is open over the control bar. There is one at a time: opening
// one closes the one that was open.
export const CONTROLS_VIEWS = {
    NONE: "none",
    REACTIONS: "reactions",
    NEARBY: "nearby",
    STATUS: "status",
    SOUNDBOARD: "soundboard",
} as const;

export type ControlsView = (typeof CONTROLS_VIEWS)[keyof typeof CONTROLS_VIEWS];
