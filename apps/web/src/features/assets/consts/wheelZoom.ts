// How long the wheel rests before it can change the zoom again, in ms. A
// trackpad pinch sends dozens of events, and without it a single pinch would
// run through every level.
export const WHEEL_ZOOM_INTERVAL_MS = 120;
