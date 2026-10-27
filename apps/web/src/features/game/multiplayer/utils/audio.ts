import {
    MAX_AUDIBLE_STREAMS,
    MAX_AUDIBLE_STREAMS_WEAK_DEVICE,
    WEAK_DEVICE_MAX_CORES,
    WEAK_DEVICE_MIN_MEMORY_GB,
} from "../consts/audio";

export type AudibleCandidate = {
    id: string;
    isSpeaking: boolean;
    // The local distance curve's volume (see calculatePresetVolume).
    volume: number;
};

// Which peers get to be heard when more are in range than the ceiling
// allows: speakers first, then the nearest (a higher distance volume is a
// shorter distance), then id so the pick is stable between ticks. Peers out
// of range (volume 0) are never picked.
export const selectAudiblePeers = (
    candidates: readonly AudibleCandidate[],
    ceiling: number
): Set<string> => {
    const ranked = candidates
        .filter((candidate) => candidate.volume > 0)
        .sort((a, b) => {
            if (a.isSpeaking !== b.isSpeaking) return a.isSpeaking ? -1 : 1;
            if (a.volume !== b.volume) return b.volume - a.volume;
            return a.id.localeCompare(b.id);
        });

    return new Set(ranked.slice(0, Math.max(ceiling, 0)).map((c) => c.id));
};

// 4 on weak machines, 8 otherwise. Both stay at or above the 4 voices the
// server sends in normal mode. A browser that does not expose a signal
// (Safari and Firefox have no deviceMemory) is not treated as weak for it.
export const getAudibleCeiling = (hardware: {
    hardwareConcurrency?: number;
    deviceMemory?: number;
}): number => {
    const { hardwareConcurrency, deviceMemory } = hardware;
    const fewCores =
        hardwareConcurrency !== undefined &&
        hardwareConcurrency <= WEAK_DEVICE_MAX_CORES;
    const littleMemory =
        deviceMemory !== undefined && deviceMemory < WEAK_DEVICE_MIN_MEMORY_GB;

    if (fewCores || littleMemory) return MAX_AUDIBLE_STREAMS_WEAK_DEVICE;
    return MAX_AUDIBLE_STREAMS;
};

// Pulled out of SpeakingDetector's poll so the threshold comparison itself
// is testable without a real AnalyserNode. `level` is an RMS reading
// (see SpeakingDetector.rms), not a raw sample average.
export const checkIsSpeaking = (level: number, threshold: number): boolean =>
    level > threshold;
