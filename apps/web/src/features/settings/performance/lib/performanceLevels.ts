import {
    CUSTOM_PERFORMANCE_LEVEL,
    PERFORMANCE_LEVEL_IDS,
    PERFORMANCE_LEVELS,
    type PerformanceLevel,
    type PerformanceLevelChoice,
} from "@/features/settings/performance/consts/performanceLevels";
import type { PerformanceSettings } from "@/features/settings/performance/consts/performanceSettings";

export const getLevelSettings = (
    level: PerformanceLevel
): PerformanceSettings => ({
    fpsLimit: PERFORMANCE_LEVELS[level].fpsLimit,
    reduceMotion: PERFORMANCE_LEVELS[level].reduceMotion,
});

export const getLevelTeleport = (level: PerformanceLevel): boolean =>
    PERFORMANCE_LEVELS[level].teleportWhenBlocked;

// The level whose knobs equal the current ones, or custom when none does.
export const getPerformanceLevel = (
    settings: PerformanceSettings,
    teleportWhenBlocked: boolean
): PerformanceLevelChoice =>
    PERFORMANCE_LEVEL_IDS.find((level) => {
        const preset = PERFORMANCE_LEVELS[level];
        return (
            preset.fpsLimit === settings.fpsLimit &&
            preset.reduceMotion === settings.reduceMotion &&
            preset.teleportWhenBlocked === teleportWhenBlocked
        );
    }) ?? CUSTOM_PERFORMANCE_LEVEL;
