import type { DecodedSource } from "../types/audio";
import type { TrimRange } from "../types/trim";

const msToSample = (ms: number, sampleRate: number): number =>
    Math.round((ms * sampleRate) / 1000);

/**
 * Cuts the range out of the source and mixes it down to mono, which is what
 * the clip is stored as. The range is clamped to the source, and an inverted
 * or empty range gives an empty result, never a throw.
 */
export const cutAudioRange = (
    source: DecodedSource,
    { startMs, endMs }: TrimRange
): Float32Array<ArrayBuffer> => {
    const start = Math.min(
        Math.max(msToSample(startMs, source.sampleRate), 0),
        source.length
    );
    const end = Math.min(
        Math.max(msToSample(endMs, source.sampleRate), 0),
        source.length
    );
    if (end <= start) return new Float32Array(0);

    const mono = new Float32Array(end - start);
    const channelCount = source.channels.length;
    source.channels.forEach((channel) => {
        channel.subarray(start, end).forEach((value, index) => {
            mono[index] += value / channelCount;
        });
    });
    return mono;
};
