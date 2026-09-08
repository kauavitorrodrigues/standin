// Linear volume falloff by proximity: 1 right on top of the peer, 0 at
// (and beyond) maxRadius. Clamped so a distance past maxRadius never goes
// negative.
export const calculateVolumeFromDistance = (
    distance: number,
    maxRadius: number
): number => {
    if (maxRadius <= 0) return 0;
    const clampedDistance = Math.min(Math.max(distance, 0), maxRadius);
    return 1 - clampedDistance / maxRadius;
};

// Pulled out of SpeakingDetector's poll so the threshold comparison itself
// is testable without a real AnalyserNode. `level` is an RMS reading
// (see SpeakingDetector.rms), not a raw sample average.
export const checkIsSpeaking = (level: number, threshold: number): boolean =>
    level > threshold;
