import { useSyncExternalStore } from "react";
import { audioProcessingPreference } from "@/features/media-devices/lib/audioSettingsPreferences";

export const useAudioProcessingPreference = () =>
    useSyncExternalStore(
        audioProcessingPreference.subscribe,
        audioProcessingPreference.get
    );
