// Distance (in world/pixel units, same space as Player/RemoteAvatar
// coordinates) beyond which a remote peer's audio is fully silent. Tuned
// tight on purpose: avatars are 8px-radius circles, so 120px is only
// about 7-8 avatar-widths, close to actually standing next to someone
// rather than merely sharing a room.
export const MAX_AUDIBLE_RADIUS = 120;

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
