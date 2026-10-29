// How often the planner looks at the people whose surroundings changed. The
// planner holds a receiver for the minimum change interval anyway, so a
// faster tick would only ask it again for nothing.
export const MEDIA_TICK_MS = 250;

// How often the CPU time of the worker is read, to tell how much of a core it
// is using. The load monitor then decides whether videos are held back.
export const MEDIA_LOAD_SAMPLE_MS = 2000;

// A worker that died is started again after this long.
export const MEDIA_RESTART_DELAY_MS = 1000;
