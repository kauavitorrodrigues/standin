import { useEffect } from "react";
import { DegradationSeverity } from "@/features/settings/performance/lib/degradation/DegradationSeverity";
import { DegradationMonitor } from "@/features/settings/performance/lib/degradation/DegradationMonitor";
import { degradationEffects } from "@/features/settings/performance/lib/degradation/DegradationEffects";
import { useDegradationSeverity } from "@/features/settings/performance/hooks/useDegradationSeverity";

// Turns the monitor's severity into the override layer. Degraded lowers the
// settings temporarily, None gives the user's own settings back.
export const useApplyDegradation = () => {
    const severity = useDegradationSeverity();

    useEffect(() => {
        const monitor = DegradationMonitor.getInstance();
        switch (severity) {
            case DegradationSeverity.Degraded:
                degradationEffects.degrade({
                    signalId: monitor.getDegradedSignalId() ?? "unknown",
                    hardwareLimited: monitor.isHardwarePerformanceLimited(),
                });
                return;
            default:
                degradationEffects.recover();
        }
    }, [severity]);
};
