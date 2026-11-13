import { useSyncExternalStore } from "react";
import { ambientSettingsPreference } from "@/features/ambient/lib/ambientSettingsPreferences";

export const useAmbientSettingsPreference = () =>
    useSyncExternalStore(
        ambientSettingsPreference.subscribe,
        ambientSettingsPreference.get
    );
