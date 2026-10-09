import { useSyncExternalStore } from "react";
import { mirrorSelfCameraPreference } from "@/features/media-devices/lib/videoSettingsPreferences";

export const useMirrorSelfCameraPreference = () =>
    useSyncExternalStore(
        mirrorSelfCameraPreference.subscribe,
        mirrorSelfCameraPreference.get
    );
