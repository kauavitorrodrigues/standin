// Bitrates (kbps) of Layer III, indexed by the 4 bit field of the header.
// Index 0 is "free format" and 15 is invalid, neither is accepted.
export const MPEG1_LAYER3_BITRATES = [
    0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320,
] as const;

export const MPEG2_LAYER3_BITRATES = [
    0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160,
] as const;

// Sample rates by the 2 bit field of the header, per MPEG version.
export const MPEG1_SAMPLE_RATES = [44100, 48000, 32000] as const;
export const MPEG2_SAMPLE_RATES = [22050, 24000, 16000] as const;
export const MPEG25_SAMPLE_RATES = [11025, 12000, 8000] as const;

// Keyed by the version field of the header: 0 is MPEG 2.5, 2 is MPEG 2, 3 is
// MPEG 1. Version 1 is reserved and has no entry.
export const SAMPLE_RATES_BY_VERSION: Record<number, readonly number[]> = {
    0: MPEG25_SAMPLE_RATES,
    2: MPEG2_SAMPLE_RATES,
    3: MPEG1_SAMPLE_RATES,
};

export const MPEG1_SAMPLES_PER_FRAME = 1152;
export const MPEG2_SAMPLES_PER_FRAME = 576;

// Bytes of a header, and of the ID3v2 header that may open the file.
export const FRAME_HEADER_BYTES = 4;
export const ID3V2_HEADER_BYTES = 10;

// More than a partial last frame and an ID3v1 tag after the sound means the
// file carries something else, so it is refused.
export const MAX_TRAILING_BYTES = 1600;

// A Xing or Info frame is metadata of the encoder, not sound.
export const VBR_TAGS = ["Xing", "Info"] as const;
export const VBR_TAG_SEARCH_BYTES = 40;
