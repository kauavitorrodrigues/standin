import type { PerformanceSettings } from "@/features/settings/performance/consts/performanceSettings";

// The knobs of a level: PerformanceSettings plus the teleport preference, which
// lives in the game feature and is only turned off by power saver.
export type PerformanceLevelKnobs = PerformanceSettings & {
    teleportWhenBlocked: boolean;
};

// Each level sets every knob together. "best" equals the defaults of
// PerformanceSettings and of the teleport preference, so today's behavior is
// the default level.
export const PERFORMANCE_LEVELS = {
    best: { fpsLimit: "auto", reduceMotion: false, teleportWhenBlocked: true },
    balanced: {
        fpsLimit: "60",
        reduceMotion: false,
        teleportWhenBlocked: true,
    },
    low: { fpsLimit: "30", reduceMotion: false, teleportWhenBlocked: true },
    powerSaver: {
        fpsLimit: "30",
        reduceMotion: true,
        teleportWhenBlocked: false,
    },
} as const satisfies Record<string, PerformanceLevelKnobs>;

export type PerformanceLevel = keyof typeof PERFORMANCE_LEVELS;

// Settings that match no level, for example after changing a single knob.
export const CUSTOM_PERFORMANCE_LEVEL = "custom";

export type PerformanceLevelChoice =
    PerformanceLevel | typeof CUSTOM_PERFORMANCE_LEVEL;

export const PERFORMANCE_LEVEL_IDS = Object.keys(
    PERFORMANCE_LEVELS
) as PerformanceLevel[];

export const DEFAULT_PERFORMANCE_LEVEL: PerformanceLevel = "best";

// What automatic degradation lowers the machine to.
export const DEGRADED_PERFORMANCE_LEVEL: PerformanceLevel = "powerSaver";
