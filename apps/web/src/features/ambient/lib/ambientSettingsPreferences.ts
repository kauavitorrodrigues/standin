import {
    AMBIENT_SETTINGS_STORAGE_KEY,
    DEFAULT_AMBIENT_SETTINGS,
} from "@/features/ambient/consts/ambientSettings";
import type { AmbientSettings } from "@/features/ambient/types";
import { createLocalPreference } from "@/lib/createLocalPreference";

export const parseAmbientSettings = (stored: unknown): AmbientSettings => {
    if (typeof stored !== "object" || stored === null)
        return DEFAULT_AMBIENT_SETTINGS;

    const record = stored as Record<string, unknown>;
    const defaults = DEFAULT_AMBIENT_SETTINGS;
    return {
        listenAutomatically:
            typeof record.listenAutomatically === "boolean"
                ? record.listenAutomatically
                : defaults.listenAutomatically,
        lowerBackgroundVolume:
            typeof record.lowerBackgroundVolume === "boolean"
                ? record.lowerBackgroundVolume
                : defaults.lowerBackgroundVolume,
    };
};

export const ambientSettingsPreference = createLocalPreference({
    key: AMBIENT_SETTINGS_STORAGE_KEY,
    fallback: DEFAULT_AMBIENT_SETTINGS,
    parse: parseAmbientSettings,
});
