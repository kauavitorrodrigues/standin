export const AUDIO_PROCESSING_KEYS = [
    "noiseSuppression",
    "echoCancellation",
    "autoGainControl",
] as const;

export type AudioProcessingKey = (typeof AUDIO_PROCESSING_KEYS)[number];

export type AudioProcessingSettings = Record<AudioProcessingKey, boolean>;

export const DEFAULT_AUDIO_PROCESSING: AudioProcessingSettings = {
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
};

export const AUDIO_PROCESSING_STORAGE_KEY = "media_audio_processing";

// Master volume of everyone else's voice, on top of the distance falloff.
export const DEFAULT_OUTPUT_VOLUME = 1;
export const OUTPUT_VOLUME_STORAGE_KEY = "media_output_volume";
