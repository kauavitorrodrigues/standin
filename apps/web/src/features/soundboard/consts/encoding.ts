// Mono mp3 at this rate: a 10 s clip is about 160 KB, well under the limit.
export const SOUNDBOARD_ENCODE_KBPS = 128;

// Bytes per second the encoder writes, used for the size estimate.
export const SOUNDBOARD_ENCODE_BYTES_PER_SECOND =
    (SOUNDBOARD_ENCODE_KBPS * 1000) / 8;

// The mp3 frame is 1152 samples; the encoder is fed in blocks of this size.
export const SOUNDBOARD_ENCODE_BLOCK_SAMPLES = 1152;

// Slack for the encoder delay, headers and the last frame.
export const SOUNDBOARD_ENCODE_OVERHEAD_BYTES = 2048;

// The encoder takes mono.
export const SOUNDBOARD_ENCODE_CHANNELS = 1;
