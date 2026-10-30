// The part of AudioContext the mixer uses, so tests can pass a fake.
export type MixerContext = Pick<
    AudioContext,
    | "createMediaStreamSource"
    | "createMediaStreamDestination"
    | "createGain"
    | "createBufferSource"
    | "createDynamicsCompressor"
    | "destination"
    | "state"
    | "resume"
    | "close"
>;
