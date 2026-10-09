import { useSyncExternalStore } from "react";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";

export const usePerformanceSettingsPreference = () =>
    useSyncExternalStore(
        performanceSettingsPreference.subscribe,
        performanceSettingsPreference.get
    );
