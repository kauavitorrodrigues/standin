// The view that is open over the control bar. There is one at a time: opening
// the reactions closes the nearby panel and the other way around.
export const CONTROLS_VIEWS = {
    NONE: "none",
    REACTIONS: "reactions",
    NEARBY: "nearby",
} as const;

export type ControlsView = (typeof CONTROLS_VIEWS)[keyof typeof CONTROLS_VIEWS];
