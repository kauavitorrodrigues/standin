import {
    SOUNDBOARD_ENCODE_BYTES_PER_SECOND,
    SOUNDBOARD_ENCODE_OVERHEAD_BYTES,
} from "../consts/encoding";

export const estimateClipBytes = (durationMs: number): number =>
    Math.ceil((durationMs / 1000) * SOUNDBOARD_ENCODE_BYTES_PER_SECOND) +
    SOUNDBOARD_ENCODE_OVERHEAD_BYTES;
