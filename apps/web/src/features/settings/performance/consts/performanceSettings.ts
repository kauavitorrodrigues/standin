// 0 is no limit: the game runs at whatever rate the screen refreshes.
export const FPS_LIMITS = { auto: 0, "60": 60, "30": 30 } as const;

export type FpsLimit = keyof typeof FPS_LIMITS;

export const FPS_LIMIT_IDS = Object.keys(FPS_LIMITS) as FpsLimit[];

export type PerformanceSettings = {
    fpsLimit: FpsLimit;
    reduceMotion: boolean;
};

export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
    fpsLimit: "auto",
    reduceMotion: false,
};

export const PERFORMANCE_SETTINGS_STORAGE_KEY = "performance_settings";
