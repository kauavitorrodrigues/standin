import {
    AUDIO_PROCESSING_KEYS,
    AUDIO_PROCESSING_STORAGE_KEY,
    DEFAULT_AUDIO_PROCESSING,
    DEFAULT_OUTPUT_VOLUME,
    OUTPUT_VOLUME_STORAGE_KEY,
    type AudioProcessingSettings,
} from "@/features/media-devices/consts/audioSettings";
import { createLocalPreference } from "@/lib/createLocalPreference";

const parseAudioProcessing = (stored: unknown): AudioProcessingSettings => {
    if (typeof stored !== "object" || stored === null)
        return DEFAULT_AUDIO_PROCESSING;

    const record = stored as Record<string, unknown>;
    const entries = AUDIO_PROCESSING_KEYS.map((key) => [
        key,
        typeof record[key] === "boolean"
            ? record[key]
            : DEFAULT_AUDIO_PROCESSING[key],
    ]);
    return Object.fromEntries(entries) as AudioProcessingSettings;
};

const parseOutputVolume = (stored: unknown): number =>
    typeof stored === "number" && stored >= 0 && stored <= 1
        ? stored
        : DEFAULT_OUTPUT_VOLUME;

export const audioProcessingPreference = createLocalPreference({
    key: AUDIO_PROCESSING_STORAGE_KEY,
    fallback: DEFAULT_AUDIO_PROCESSING,
    parse: parseAudioProcessing,
});

export const outputVolumePreference = createLocalPreference({
    key: OUTPUT_VOLUME_STORAGE_KEY,
    fallback: DEFAULT_OUTPUT_VOLUME,
    parse: parseOutputVolume,
});
