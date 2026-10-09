import {
    DEFAULT_SCREEN_SHARE_SETTINGS,
    SCREEN_CONTENT_HINTS,
    SCREEN_FRAME_RATE_IDS,
    SCREEN_IDLE_GRACE_IDS,
    SCREEN_RESOLUTION_IDS,
    SCREEN_SHARE_SETTINGS_STORAGE_KEY,
    type ScreenShareSettings,
} from "@/features/media-devices/consts/streamingSettings";
import { pickAllowed } from "@/lib/pickAllowed";
import { createLocalPreference } from "@/lib/createLocalPreference";

const parseScreenShareSettings = (stored: unknown): ScreenShareSettings => {
    if (typeof stored !== "object" || stored === null)
        return DEFAULT_SCREEN_SHARE_SETTINGS;

    const record = stored as Record<string, unknown>;
    const defaults = DEFAULT_SCREEN_SHARE_SETTINGS;
    return {
        resolution: pickAllowed(
            record.resolution,
            SCREEN_RESOLUTION_IDS,
            defaults.resolution
        ),
        frameRate: pickAllowed(
            record.frameRate,
            SCREEN_FRAME_RATE_IDS,
            defaults.frameRate
        ),
        contentHint: pickAllowed(
            record.contentHint,
            SCREEN_CONTENT_HINTS,
            defaults.contentHint
        ),
        idleGrace: pickAllowed(
            record.idleGrace,
            SCREEN_IDLE_GRACE_IDS,
            defaults.idleGrace
        ),
    };
};

export const screenShareSettingsPreference = createLocalPreference({
    key: SCREEN_SHARE_SETTINGS_STORAGE_KEY,
    fallback: DEFAULT_SCREEN_SHARE_SETTINGS,
    parse: parseScreenShareSettings,
});
