import { BaseDegradationSignal } from "./BaseDegradationSignal";
import { DegradationSeverity } from "./DegradationSeverity";
import { getWebrtcCpuSignal } from "./WebrtcCpuSignal";

declare global {
    interface Window {
        __degrade?: (degraded: boolean) => void;
        // Feeds a synthetic cpu limitation of this many seconds through the
        // real window, so the thresholds and the silence timeout apply.
        __degradeCpu?: (seconds: number) => void;
    }
}

export class DebugSignal extends BaseDegradationSignal {
    readonly id = "debug";

    start() {
        window.__degrade = (degraded: boolean) => {
            this.setSeverity(degraded ? DegradationSeverity.Degraded : DegradationSeverity.None);
        };
        window.__degradeCpu = (seconds: number) => {
            getWebrtcCpuSignal().handleQualityLimitation({
                reason: "cpu",
                cpuLimitedDuration: seconds,
            });
        };
    }

    stop() {
        delete window.__degrade;
        delete window.__degradeCpu;
        this.setSeverity(DegradationSeverity.None);
    }
}
