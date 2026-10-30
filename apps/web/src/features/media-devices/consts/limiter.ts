// The limiter on what is published: it only catches peaks, so several clips
// playing at once cannot clip the track, and the voice goes through untouched
// below the threshold.
export const MIXER_LIMITER = {
    thresholdDb: -3,
    kneeDb: 0,
    ratio: 20,
    attackSeconds: 0.003,
    releaseSeconds: 0.1,
};
