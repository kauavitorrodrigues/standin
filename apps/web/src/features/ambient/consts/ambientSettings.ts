import type { AmbientSettings } from "@/features/ambient/types";

export const DEFAULT_AMBIENT_SETTINGS: AmbientSettings = {
    listenAutomatically: true,
    lowerBackgroundVolume: false,
};

export const AMBIENT_SETTINGS_STORAGE_KEY = "ambient_settings";

// Share of the ambient volume that is kept when the background is lowered.
export const LOWERED_AMBIENT_FACTOR = 0.5;
