import { useSyncExternalStore } from "react";
import { outputVolumePreference } from "@/features/media-devices/lib/audioSettingsPreferences";

export const useOutputVolumePreference = () =>
    useSyncExternalStore(
        outputVolumePreference.subscribe,
        outputVolumePreference.get
    );
