import { BaseDegradationSignal } from "./BaseDegradationSignal";
import { DegradationSeverity } from "./DegradationSeverity";

declare global {
    interface Window {
        __degrade?: (degraded: boolean) => void;
    }
}

export class DebugSignal extends BaseDegradationSignal {
    readonly id = "debug";

    start() {
        window.__degrade = (degraded: boolean) => {
            this.setSeverity(degraded ? DegradationSeverity.Degraded : DegradationSeverity.None);
        };
    }

    stop() {
        delete window.__degrade;
        this.setSeverity(DegradationSeverity.None);
    }
}
