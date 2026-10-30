// A play that is running: its sound and the gain it goes through, so a stop
// can detach exactly it.
export type RunningPlay = {
    source: AudioBufferSourceNode;
    gain: GainNode;
};
