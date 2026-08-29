export type MediaDeviceKind = "microphone" | "camera" | "speaker";
type ToggleableMediaDeviceKind = Extract<MediaDeviceKind, "microphone" | "camera">;

const ENABLED_KEY: Record<ToggleableMediaDeviceKind, string> = {
    microphone: "media_microphone_enabled",
    camera: "media_camera_enabled",
};

const DEVICE_ID_KEY: Record<MediaDeviceKind, string> = {
    microphone: "media_microphone_device_id",
    camera: "media_camera_device_id",
    speaker: "media_speaker_device_id",
};

export const getDeviceEnabledPreference = (
    kind: ToggleableMediaDeviceKind,
): boolean => {
    return localStorage.getItem(ENABLED_KEY[kind]) !== "false";
};

export const setDeviceEnabledPreference = (
    kind: ToggleableMediaDeviceKind,
    enabled: boolean,
): void => {
    localStorage.setItem(ENABLED_KEY[kind], String(enabled));
};

export const getPreferredDeviceId = (kind: MediaDeviceKind): string | null => {
    return localStorage.getItem(DEVICE_ID_KEY[kind]);
};

export const setPreferredDeviceId = (
    kind: MediaDeviceKind,
    deviceId: string,
): void => {
    localStorage.setItem(DEVICE_ID_KEY[kind], deviceId);
};
