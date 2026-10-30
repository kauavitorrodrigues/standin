import type { DecodedSource } from "../types/audio";

/** The decoded channels as an AudioBuffer, for playing the selection. */
export const toAudioBuffer = (
    context: AudioContext,
    source: DecodedSource
): AudioBuffer => {
    const buffer = context.createBuffer(
        source.channels.length,
        source.length,
        source.sampleRate
    );
    source.channels.forEach((channel, index) =>
        buffer.copyToChannel(channel, index)
    );
    return buffer;
};
