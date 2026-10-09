import { useSyncExternalStore } from "react";
import { screenShareSettingsPreference } from "@/features/media-devices/lib/streamingSettingsPreferences";

export const useScreenShareSettingsPreference = () =>
    useSyncExternalStore(
        screenShareSettingsPreference.subscribe,
        screenShareSettingsPreference.get
    );
