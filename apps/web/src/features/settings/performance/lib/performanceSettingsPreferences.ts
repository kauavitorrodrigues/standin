import {
    DEFAULT_PERFORMANCE_SETTINGS,
    FPS_LIMIT_IDS,
    PERFORMANCE_SETTINGS_STORAGE_KEY,
    VIDEO_PEER_LIMIT_IDS,
    type PerformanceSettings,
} from "@/features/settings/performance/consts/performanceSettings";
import { createLocalPreference } from "@/lib/createLocalPreference";
import { pickAllowed } from "@/lib/pickAllowed";

const parsePerformanceSettings = (stored: unknown): PerformanceSettings => {
    if (typeof stored !== "object" || stored === null)
        return DEFAULT_PERFORMANCE_SETTINGS;

    const record = stored as Record<string, unknown>;
    const defaults = DEFAULT_PERFORMANCE_SETTINGS;
    return {
        fpsLimit: pickAllowed(record.fpsLimit, FPS_LIMIT_IDS, defaults.fpsLimit),
        maxVideoPeers: pickAllowed(
            record.maxVideoPeers,
            VIDEO_PEER_LIMIT_IDS,
            defaults.maxVideoPeers
        ),
        reduceMotion:
            typeof record.reduceMotion === "boolean"
                ? record.reduceMotion
                : defaults.reduceMotion,
    };
};

export const performanceSettingsPreference = createLocalPreference({
    key: PERFORMANCE_SETTINGS_STORAGE_KEY,
    fallback: DEFAULT_PERFORMANCE_SETTINGS,
    parse: parsePerformanceSettings,
});
