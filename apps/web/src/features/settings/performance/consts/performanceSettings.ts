// 0 is no limit: the game runs at whatever rate the screen refreshes.
export const FPS_LIMITS = { auto: 0, "60": 60, "30": 30 } as const;

export type FpsLimit = keyof typeof FPS_LIMITS;

export const FPS_LIMIT_IDS = Object.keys(FPS_LIMITS) as FpsLimit[];

// How many people can receive your camera or screen at once. Every receiver
// is another encode and upload in a mesh.
export const VIDEO_PEER_LIMITS = { "1": 1, "2": 2, "3": 3, "4": 4 } as const;

export type VideoPeerLimit = keyof typeof VIDEO_PEER_LIMITS;

export const VIDEO_PEER_LIMIT_IDS = Object.keys(
    VIDEO_PEER_LIMITS
) as VideoPeerLimit[];

export type PerformanceSettings = {
    fpsLimit: FpsLimit;
    maxVideoPeers: VideoPeerLimit;
    reduceMotion: boolean;
};

export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
    fpsLimit: "auto",
    maxVideoPeers: "4",
    reduceMotion: false,
};

export const PERFORMANCE_SETTINGS_STORAGE_KEY = "performance_settings";
