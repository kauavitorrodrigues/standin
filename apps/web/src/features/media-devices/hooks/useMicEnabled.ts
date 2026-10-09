import { useSyncExternalStore } from "react";
import {
    getDeviceEnabledPreference,
    subscribeToMicrophoneEnabledPreference,
} from "@/features/media-devices/lib/mediaDevicePreferences";

// Live value of the mic toggle, for components that only need to show it
// (the toggle button itself owns the state through useMediaDeviceControl).
export const useMicEnabled = (): boolean =>
    useSyncExternalStore(
        (onChange) => subscribeToMicrophoneEnabledPreference(onChange),
        () => getDeviceEnabledPreference("microphone")
    );
