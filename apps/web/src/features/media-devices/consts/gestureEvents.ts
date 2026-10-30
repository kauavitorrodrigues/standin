import type { GestureEvent } from "../types/gestureEvent";

// The first of these after a suspension lets a context start again.
export const GESTURE_EVENTS: readonly GestureEvent[] = [
    "pointerdown",
    "keydown",
];
