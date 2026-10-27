// How many people a space can hold before the camera is captured smaller, so
// a crowded space does not weigh on every machine. Each limit is held until
// the count falls this far below it, so a person joining and leaving at the
// border does not make the camera restart over and over.
export const FULL_HD_MAX_PEOPLE = 8;
export const HD_MAX_PEOPLE = 25;
export const CAMERA_LIMIT_RETURN_MARGIN = 2;

// A machine with this many cores or fewer, or this much memory in gigabytes
// or less, is kept at 720p. The browser reports both roughly, and the memory
// only in some browsers.
export const WEAK_DEVICE_MAX_CORES = 4;
export const WEAK_DEVICE_MAX_MEMORY_GB = 4;
