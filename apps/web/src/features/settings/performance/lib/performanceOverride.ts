import { createMemoryStore } from "@/lib/createMemoryStore";
import { type PerformanceSettings } from "@/features/settings/performance/consts/performanceSettings";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";

// A temporary layer over the persisted preference, set while the machine is
// degraded and dropped on recovery. effective = override ?? user, per field,
// so clearing it restores the user's settings exactly.
// The override is separate from the user's own level.
export type PerformanceOverride = {
    settings: Partial<PerformanceSettings>;
    // Camera sends at CAMERA_ENCODING_FLOOR_BITRATE (see getVideoEncoding).
    lowCameraBitrate: boolean;
};

export const NO_PERFORMANCE_OVERRIDE: PerformanceOverride = {
    settings: {},
    lowCameraBitrate: false,
};

export const performanceOverrideStore = createMemoryStore<PerformanceOverride>(
    NO_PERFORMANCE_OVERRIDE
);

export const resolveEffectiveSettings = (
    user: PerformanceSettings,
    override: PerformanceOverride
): PerformanceSettings => ({
    fpsLimit: override.settings.fpsLimit ?? user.fpsLimit,
    maxVideoPeers: override.settings.maxVideoPeers ?? user.maxVideoPeers,
    reduceMotion: override.settings.reduceMotion ?? user.reduceMotion,
});

// The snapshot is cached by the identity of its inputs so that
// useSyncExternalStore sees a stable value between changes.
let cache: {
    user: PerformanceSettings;
    override: PerformanceOverride;
    value: PerformanceSettings;
} | null = null;

const getEffective = (): PerformanceSettings => {
    const user = performanceSettingsPreference.get();
    const override = performanceOverrideStore.get();
    if (cache?.user === user && cache.override === override)
        return cache.value;

    cache = { user, override, value: resolveEffectiveSettings(user, override) };
    return cache.value;
};

export const effectivePerformanceSettings = {
    get: getEffective,
    subscribe: (listener: () => void) => {
        const stops = [
            performanceSettingsPreference.subscribe(listener),
            performanceOverrideStore.subscribe(listener),
        ];
        return () => stops.forEach((stop) => stop());
    },
};
