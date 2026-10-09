import {
    SCREEN_FRAME_RATES,
    SCREEN_IDLE_GRACES_MS,
    SCREEN_RESOLUTIONS,
    type ScreenShareSettings,
} from "@/features/media-devices/consts/streamingSettings";

export const getScreenConstraints = ({
    resolution,
    frameRate,
}: ScreenShareSettings): MediaTrackConstraints => ({
    width: { max: SCREEN_RESOLUTIONS[resolution].width },
    height: { max: SCREEN_RESOLUTIONS[resolution].height },
    frameRate: { ideal: SCREEN_FRAME_RATES[frameRate], max: SCREEN_FRAME_RATES[frameRate] },
});

export const getIdleGraceMs = ({ idleGrace }: ScreenShareSettings) =>
    SCREEN_IDLE_GRACES_MS[idleGrace];
