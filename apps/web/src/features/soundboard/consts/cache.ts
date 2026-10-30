// Decoded clips kept in memory: a 10 s stereo clip is about 3.5 MB decoded.
export const CLIP_CACHE_MAX_ENTRIES = 30;

// A decode only context never plays, so its length and rate are irrelevant.
export const DECODE_CONTEXT_SAMPLE_RATE = 44100;
