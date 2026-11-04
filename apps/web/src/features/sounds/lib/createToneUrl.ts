import {
    encodeWavUrl,
    WAV_SAMPLE_RATE,
} from "@/features/sounds/lib/encodeWavUrl";

// A short fading sine tone as a blob URL.
export const createToneUrl = (
    frequencyHz: number,
    durationSeconds: number
): string => {
    const sampleCount = Math.round(WAV_SAMPLE_RATE * durationSeconds);
    const samples = new Float32Array(sampleCount);

    for (let index = 0; index < sampleCount; index++) {
        const progress = index / sampleCount;
        const fade = (1 - progress) ** 2;
        samples[index] =
            Math.sin((2 * Math.PI * frequencyHz * index) / WAV_SAMPLE_RATE) *
            fade;
    }

    return encodeWavUrl(samples);
};
