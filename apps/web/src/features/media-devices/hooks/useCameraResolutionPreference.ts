import { useSyncExternalStore } from "react";
import { cameraResolutionPreference } from "@/features/media-devices/lib/videoSettingsPreferences";

export const useCameraResolutionPreference = () =>
    useSyncExternalStore(
        cameraResolutionPreference.subscribe,
        cameraResolutionPreference.get
    );
