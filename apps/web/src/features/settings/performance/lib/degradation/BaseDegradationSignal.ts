import { DegradationSeverity } from "./DegradationSeverity";
import type { DegradationSignal } from "./DegradationSignal";

export abstract class BaseDegradationSignal implements DegradationSignal {
    abstract readonly id: string;
    isHardwarePerformanceLimited = false;
    severity: DegradationSeverity = DegradationSeverity.None;
    private listeners = new Set<() => void>();

    abstract start(): void;
    abstract stop(): void;

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    protected setSeverity(severity: DegradationSeverity) {
        if (severity === this.severity) return;
        this.severity = severity;
        this.listeners.forEach((listener) => listener());
    }
}
