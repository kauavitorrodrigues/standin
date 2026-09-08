export type MediaDeviceKind = "microphone" | "camera" | "speaker";
type ToggleableMediaDeviceKind = Extract<
    MediaDeviceKind,
    "microphone" | "camera"
>;

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
    kind: ToggleableMediaDeviceKind
): boolean => {
    return localStorage.getItem(ENABLED_KEY[kind]) !== "false";
};

// localStorage itself doesn't notify same-tab listeners on write, only
// other tabs, via the "storage" event. useLocalAudioStream is a separate
// hook instance from whichever component owns the mute toggle, so it
// needs its own way to react live to a mic mute/unmute instead of only
// reading the preference once at mount.
type MicrophoneEnabledListener = (enabled: boolean) => void;
const microphoneEnabledListeners = new Set<MicrophoneEnabledListener>();

export const setDeviceEnabledPreference = (
    kind: ToggleableMediaDeviceKind,
    enabled: boolean
): void => {
    localStorage.setItem(ENABLED_KEY[kind], String(enabled));
    if (kind === "microphone") {
        microphoneEnabledListeners.forEach((listener) => listener(enabled));
    }
};

export const subscribeToMicrophoneEnabledPreference = (
    listener: MicrophoneEnabledListener
): (() => void) => {
    microphoneEnabledListeners.add(listener);
    return () => microphoneEnabledListeners.delete(listener);
};

export const getPreferredDeviceId = (kind: MediaDeviceKind): string | null => {
    return localStorage.getItem(DEVICE_ID_KEY[kind]);
};

// Same same-tab problem as the enabled listeners above: useLocalAudioStream
// needs to react live when the mic (or speaker) device preference changes
// from a different hook instance (the device picker), not just re-read it
// once at mount.
type DeviceIdListener = (deviceId: string) => void;
const deviceIdListeners: Record<MediaDeviceKind, Set<DeviceIdListener>> = {
    microphone: new Set(),
    camera: new Set(),
    speaker: new Set(),
};

export const setPreferredDeviceId = (
    kind: MediaDeviceKind,
    deviceId: string
): void => {
    localStorage.setItem(DEVICE_ID_KEY[kind], deviceId);
    deviceIdListeners[kind].forEach((listener) => listener(deviceId));
};

export const subscribeToPreferredDeviceId = (
    kind: MediaDeviceKind,
    listener: DeviceIdListener
): (() => void) => {
    deviceIdListeners[kind].add(listener);
    return () => deviceIdListeners[kind].delete(listener);
};

// For a persisted preference that's gone stale (the device was unplugged,
// or permissions changed) and would otherwise make every future
// getUserMedia call fail with the same OverconstrainedError forever.
// Notifies with "" (no preference), same as getPreferredDeviceId returning
// null after this.
export const clearPreferredDeviceId = (kind: MediaDeviceKind): void => {
    localStorage.removeItem(DEVICE_ID_KEY[kind]);
    deviceIdListeners[kind].forEach((listener) => listener(""));
};
