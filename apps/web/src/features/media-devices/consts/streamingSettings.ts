import { SCREEN_SHARE_IDLE_GRACE_MS } from "@/features/media-devices/consts/videoConstraints";

// The resolution tiers applied with applyConstraints after the capture. The box is square, not 16:9: the
// browser fits the screen inside it keeping its aspect ratio.
export const SCREEN_RESOLUTION_TIERS = {
    LOW: { width: { max: 1280 }, height: { max: 1280 } },
    MED: { width: { max: 1920 }, height: { max: 1920 } },
    HIGH: { width: { max: 2880 }, height: { max: 2880 } },
} as const;

export type ScreenResolutionTier = keyof typeof SCREEN_RESOLUTION_TIERS;

// The tier a share falls back to when the performance level says HD is off.
export const SCREEN_HD_OFF_TIER: ScreenResolutionTier = "MED";

// getDisplayMedia is asked for the highest tier, which is narrowed afterwards.
export const SCREEN_CAPTURE_REQUEST_MAX = 2880;

// A capture is narrowed to 1080p by default: a 1440p or 4K monitor would
// otherwise hand the encoder several times more pixels per frame than it can
// keep up with on a modest machine, which stutters the share and the rest of
// the page with it. The encoder limits (see getVideoEncoding) then only have
// to tune bitrate. The default is the MED tier, HIGH is opt in and LOW is the 720p choice.
export const SCREEN_RESOLUTIONS = {
    "720p": "LOW",
    "1080p": "MED",
    "2880p": "HIGH",
} as const satisfies Record<string, ScreenResolutionTier>;

export type ScreenResolution = keyof typeof SCREEN_RESOLUTIONS;

export const SCREEN_RESOLUTION_IDS = Object.keys(
    SCREEN_RESOLUTIONS
) as ScreenResolution[];

// Frame rate asked for when optimizing for video, against a normal 10. The normal rate stays the user's
// choice here, default 30.
export const SCREEN_HIGH_QUALITY_FRAME_RATE = 24;

// 30 is the most the encoder is asked to produce (see SCREEN_ENCODING_BASE).
export const SCREEN_FRAME_RATES = { "15": 15, "30": 30 } as const;

export type ScreenFrameRate = keyof typeof SCREEN_FRAME_RATES;

export const SCREEN_FRAME_RATE_IDS = Object.keys(
    SCREEN_FRAME_RATES
) as ScreenFrameRate[];

// What the browser gives up first when the machine or the network is short.
// "motion" holds the frame rate and lowers resolution, "detail" and "text" do
// the opposite and keep text sharp.
export const SCREEN_CONTENT_HINTS = ["motion", "detail", "text"] as const;

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
    // "Optimize for video": 24 fps, and a hint that follows the tier.
    highQuality: boolean;
    idleGrace: ScreenIdleGrace;
};

export const DEFAULT_SCREEN_SHARE_SETTINGS: ScreenShareSettings = {
    resolution: "1080p",
    frameRate: "30",
    contentHint: "motion",
    highQuality: false,
    idleGrace: "1m",
};

export const SCREEN_SHARE_SETTINGS_STORAGE_KEY = "media_screen_share_settings";
