import { SCREEN_SHARE_IDLE_GRACE_MS } from "@/features/media-devices/consts/videoConstraints";

// Capture is capped at 1080p: a 1440p or 4K monitor would otherwise hand the
// encoder several times more pixels per frame than it can keep up with on a
// modest machine, which stutters the share and the rest of the page with it.
// The encoder limits (see getVideoEncoding) then only have to tune bitrate.
export const SCREEN_RESOLUTIONS = {
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 },
} as const;

export type ScreenResolution = keyof typeof SCREEN_RESOLUTIONS;

export const SCREEN_RESOLUTION_IDS = Object.keys(
    SCREEN_RESOLUTIONS
) as ScreenResolution[];

// 30 is the most the encoder is asked to produce (see SCREEN_ENCODING_BASE).
export const SCREEN_FRAME_RATES = { "15": 15, "30": 30 } as const;

export type ScreenFrameRate = keyof typeof SCREEN_FRAME_RATES;

export const SCREEN_FRAME_RATE_IDS = Object.keys(
    SCREEN_FRAME_RATES
) as ScreenFrameRate[];

// What the browser gives up first when the machine or the network is short.
// "motion" holds the frame rate and lowers resolution, "detail" does the
// opposite and keeps text sharp.
export const SCREEN_CONTENT_HINTS = ["motion", "detail"] as const;

export type ScreenContentHint = (typeof SCREEN_CONTENT_HINTS)[number];

// How long a share may run with nobody in range. Null never stops it.
export const SCREEN_IDLE_GRACES_MS = {
    "30s": 30_000,
    "1m": SCREEN_SHARE_IDLE_GRACE_MS,
    "5m": 300_000,
    never: null,
} as const;

export type ScreenIdleGrace = keyof typeof SCREEN_IDLE_GRACES_MS;

export const SCREEN_IDLE_GRACE_IDS = Object.keys(
    SCREEN_IDLE_GRACES_MS
) as ScreenIdleGrace[];

export type ScreenShareSettings = {
    resolution: ScreenResolution;
    frameRate: ScreenFrameRate;
    contentHint: ScreenContentHint;
    idleGrace: ScreenIdleGrace;
};

export const DEFAULT_SCREEN_SHARE_SETTINGS: ScreenShareSettings = {
    resolution: "1080p",
    frameRate: "30",
    contentHint: "motion",
    idleGrace: "1m",
};

export const SCREEN_SHARE_SETTINGS_STORAGE_KEY = "media_screen_share_settings";
