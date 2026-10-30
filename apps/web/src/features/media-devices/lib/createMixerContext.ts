/**
 * The context the microphone is mixed in. It takes the sample rate of the
 * microphone when the browser reports it: Firefox refuses to connect a stream
 * to a context of another rate, and matching it avoids a resample elsewhere.
 */
export const createMixerContext = (micStream: MediaStream): AudioContext => {
    const sampleRate = micStream
        .getAudioTracks()[0]
        ?.getSettings?.().sampleRate;
    return sampleRate ? new AudioContext({ sampleRate }) : new AudioContext();
};
