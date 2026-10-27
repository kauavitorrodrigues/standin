import { useSyncExternalStore } from "react";
import { DegradationMonitor } from "@/features/settings/performance/lib/degradation/DegradationMonitor";

export const useDegradationSeverity = () => {
    const monitor = DegradationMonitor.getInstance();
    return useSyncExternalStore(monitor.subscribe, monitor.getSeverity);
};
