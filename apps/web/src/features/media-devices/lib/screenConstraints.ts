import {
    SCREEN_CAPTURE_REQUEST_MAX,
    SCREEN_FRAME_RATES,
    SCREEN_HIGH_QUALITY_FRAME_RATE,
    SCREEN_IDLE_GRACES_MS,
    SCREEN_RESOLUTIONS,
    SCREEN_RESOLUTION_TIERS,
    type ScreenContentHint,
    type ScreenResolutionTier,
    type ScreenShareSettings,
} from "@/features/media-devices/consts/streamingSettings";
import { resolveScreenTier } from "@/features/media-devices/utils/resolveScreenTier";

// The request handed to getDisplayMedia: always the highest box, with the
// cursor drawn. The tier and the frame rate are applied after the capture.
// `cursor` is missing from the DOM typings, hence the cast.
export const getScreenCaptureConstraints = (): MediaTrackConstraints =>
    ({
        width: { max: SCREEN_CAPTURE_REQUEST_MAX },
        height: { max: SCREEN_CAPTURE_REQUEST_MAX },
        cursor: "always",
    }) as MediaTrackConstraints;

// The sound of a share is music and system sounds, not a voice, so the
// processing meant for a microphone is off: it would pump the level and cut
// what it takes for noise. `suppressLocalAudioPlayback` keeps the sharing tab
// from playing the sound back to the person while it is also being sent, and
// is missing from the DOM typings, hence the cast.
export const getScreenAudioConstraints = (): MediaTrackConstraints =>
    ({
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        suppressLocalAudioPlayback: true,
    }) as MediaTrackConstraints;

/**
 * The tier of a share: the chosen resolution, held at MED when the
 * performance level says HD is off.
 */
export const getScreenTier = (
    { resolution }: ScreenShareSettings,
    hdAllowed = true
): ScreenResolutionTier =>
    resolveScreenTier(SCREEN_RESOLUTIONS[resolution], hdAllowed);

// Whether the share is optimized for video: only when asked for and when the
// tier was not narrowed to LOW.
const isOptimizedForVideo = (settings: ScreenShareSettings, hdAllowed: boolean) =>
    settings.highQuality && getScreenTier(settings, hdAllowed) !== "LOW";

// The constraints applied to the track after the capture.
export const getScreenTrackConstraints = (
    settings: ScreenShareSettings,
    hdAllowed = true
): MediaTrackConstraints => {
    const frameRate = isOptimizedForVideo(settings, hdAllowed)
        ? SCREEN_HIGH_QUALITY_FRAME_RATE
        : SCREEN_FRAME_RATES[settings.frameRate];

    return {
        ...SCREEN_RESOLUTION_TIERS[getScreenTier(settings, hdAllowed)],
        frameRate: { ideal: frameRate, max: frameRate },
    };
};

// "detail" or "text" is picked by tier when optimizing for video. Without
// it the user's own choice stands, whose default is "motion" because the
// detail hint made the share crawl.
export const getScreenContentHint = (
    settings: ScreenShareSettings,
    hdAllowed = true
): ScreenContentHint => {
    if (!settings.highQuality) return settings.contentHint;
    return isOptimizedForVideo(settings, hdAllowed) ? "detail" : "text";
};

export const getIdleGraceMs = ({ idleGrace }: ScreenShareSettings) =>
    SCREEN_IDLE_GRACES_MS[idleGrace];
