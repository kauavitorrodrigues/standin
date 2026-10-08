export type MediaDeviceKind = "microphone" | "camera" | "speaker";
type ToggleableMediaDeviceKind = Extract<
    MediaDeviceKind,
    "microphone" | "camera"
>;

// Only the microphone choice is remembered across visits. The camera is
// deliberately not: remembering "on" would light it, and send video to
// whoever is nearby, the next time the page opens without anyone asking.
const PERSISTED_ENABLED_KEY: Partial<Record<ToggleableMediaDeviceKind, string>> =
    {
        microphone: "media_microphone_enabled",
    };

// Choice for the kinds above that are not persisted. Lives as long as the
// page does, so toggling within a visit still works across components.
const sessionEnabled: Partial<Record<ToggleableMediaDeviceKind, boolean>> = {};

const DEVICE_ID_KEY: Record<MediaDeviceKind, string> = {
    microphone: "media_microphone_device_id",
    camera: "media_camera_device_id",
    speaker: "media_speaker_device_id",
};

// The microphone starts on, the camera starts off: turning a camera on is
// something the person must do on purpose, never a default that lights the
// device the moment the space loads.
const ENABLED_BY_DEFAULT: Record<ToggleableMediaDeviceKind, boolean> = {
    microphone: true,
    camera: false,
};

export const getDeviceEnabledPreference = (
    kind: ToggleableMediaDeviceKind
): boolean => {
    const key = PERSISTED_ENABLED_KEY[kind];
    if (!key) return sessionEnabled[kind] ?? ENABLED_BY_DEFAULT[kind];

    const stored = localStorage.getItem(key);
    if (stored === null) return ENABLED_BY_DEFAULT[kind];

    return stored === "true";
};

// localStorage itself doesn't notify same-tab listeners on write, only
// other tabs, via the "storage" event. useLocalAudioStream is a separate
// hook instance from whichever component owns the mute toggle, so it
// needs its own way to react live to a mic mute/unmute instead of only
// reading the preference once at mount.
type DeviceEnabledListener = (enabled: boolean) => void;
const deviceEnabledListeners: Record<
    ToggleableMediaDeviceKind,
    Set<DeviceEnabledListener>
> = {
    microphone: new Set(),
    camera: new Set(),
};

export const setDeviceEnabledPreference = (
    kind: ToggleableMediaDeviceKind,
    enabled: boolean
): void => {
    const key = PERSISTED_ENABLED_KEY[kind];
    if (key) localStorage.setItem(key, String(enabled));
    else sessionEnabled[kind] = enabled;
    deviceEnabledListeners[kind].forEach((listener) => listener(enabled));
};

export const subscribeToDeviceEnabledPreference = (
    kind: ToggleableMediaDeviceKind,
    listener: DeviceEnabledListener
): (() => void) => {
    deviceEnabledListeners[kind].add(listener);
    return () => deviceEnabledListeners[kind].delete(listener);
};

export const subscribeToMicrophoneEnabledPreference = (
    listener: DeviceEnabledListener
): (() => void) => subscribeToDeviceEnabledPreference("microphone", listener);

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
