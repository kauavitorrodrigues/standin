import { useSyncExternalStore } from "react";
import { effectivePerformanceSettings } from "@/features/settings/performance/lib/performanceOverride";

// The settings the app actually runs with: the user's choice with any
// degradation override on top. The settings screens keep reading the
// persisted preference so they always show what the user chose.
export const useEffectivePerformanceSettings = () =>
    useSyncExternalStore(
        effectivePerformanceSettings.subscribe,
        effectivePerformanceSettings.get
    );
