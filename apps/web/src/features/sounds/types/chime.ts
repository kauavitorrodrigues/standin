// One note of a chime. The notes may overlap, so a later one can ring over the
// tail of the one before.
export type ChimeNote = {
    frequencyHz: number;
    startSeconds: number;
    durationSeconds: number;
    // Between 0 and 1, so a chime can keep its notes balanced.
    gain: number;
};
