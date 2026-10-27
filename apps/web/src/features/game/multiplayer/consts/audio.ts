// RMS of getByteTimeDomainData, rescaled to a 0-255 range to stay in the
// same ballpark as a frequency-domain average, above which a stream counts
// as "speaking". Ambient mic noise sits low; a starting point tuned against
// real hardware during manual validation, to be revisited if it turns out
// too sensitive/insensitive in practice.
export const SPEAKING_THRESHOLD = 20;

// How often SpeakingDetector samples its AnalyserNode. A plain interval,
// not requestAnimationFrame: this drives a boolean speaking indicator, not
// an animation, so it doesn't need frame-rate cadence - 10Hz is already
// well above what a human can perceive as a change in the ring's state.
export const SPEAKING_POLL_INTERVAL_MS = 100;

// Safety net on how many remote streams may be audible at once. The server
// already limits a person to LOUDEST_SPEAKERS voices (4 in normal mode, 2 in
// low quality mode, packages/media/src/consts), so this ceiling must never be
// lower than 4 or it would pause a voice the server decided to send. The rest
// stay attached but paused. Weak machines get the lower ceiling.
export const MAX_AUDIBLE_STREAMS = 8;
export const MAX_AUDIBLE_STREAMS_WEAK_DEVICE = 4;

// A machine counts as weak at or below this many logical cores, or below
// this much RAM in GB (navigator.deviceMemory is capped at 8 by browsers).
export const WEAK_DEVICE_MAX_CORES = 4;
export const WEAK_DEVICE_MIN_MEMORY_GB = 8;
