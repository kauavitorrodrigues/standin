import type { DegradationSeverity } from "./DegradationSeverity";

export interface DegradationSignal {
    id: string;
    severity: DegradationSeverity;
    isHardwarePerformanceLimited: boolean;
    start: () => void;
    stop: () => void;
    subscribe: (listener: () => void) => () => void;
}
