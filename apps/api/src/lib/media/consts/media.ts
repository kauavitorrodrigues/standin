// How often the planner looks at the people whose surroundings changed. The
// planner holds a receiver for the minimum change interval anyway, so a
// faster tick would only ask it again for nothing.
export const MEDIA_TICK_MS = 250;

// A worker that died is started again after this long.
export const MEDIA_RESTART_DELAY_MS = 1000;
