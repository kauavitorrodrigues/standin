import { BatterySignal } from "./BatterySignal";
import { DebugSignal } from "./DebugSignal";
import { DegradationSeverity } from "./DegradationSeverity";
import type { DegradationSignal } from "./DegradationSignal";
import { getWebrtcCpuSignal } from "./WebrtcCpuSignal";

export class DegradationMonitor {
    private static instance: DegradationMonitor | null = null;

    static getInstance() {
        DegradationMonitor.instance ??= new DegradationMonitor(createDefaultSignals());
        return DegradationMonitor.instance;
    }

    private listeners = new Set<() => void>();
    private unsubscribes: Array<() => void> = [];
    private started = false;

    private signals: DegradationSignal[];

    constructor(signals: DegradationSignal[]) {
        this.signals = signals;
    }

    getSeverity = (): DegradationSeverity => {
        let severity: DegradationSeverity = DegradationSeverity.None;
        this.signals.forEach((signal) => {
            severity = Math.max(severity, signal.severity) as DegradationSeverity;
        });
        return severity;
    };

    isHardwarePerformanceLimited = () =>
        this.signals.some((signal) => signal.isHardwarePerformanceLimited && signal.severity === DegradationSeverity.Degraded);

    getDegradedSignalId = () =>
        this.signals.find((signal) => signal.severity === DegradationSeverity.Degraded)?.id ?? null;

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        this.start();
        return () => {
            this.listeners.delete(listener);
            if (this.listeners.size === 0) this.stop();
        };
    };

    private start() {
        if (this.started) return;
        this.started = true;
        this.unsubscribes = this.signals.map((signal) => signal.subscribe(this.notify));
        this.signals.forEach((signal) => signal.start());
    }

    private stop() {
        if (!this.started) return;
        this.started = false;
        this.signals.forEach((signal) => signal.stop());
        this.unsubscribes.forEach((unsubscribe) => unsubscribe());
        this.unsubscribes = [];
    }

    private notify = () => {
        this.listeners.forEach((listener) => listener());
    };
}

const createDefaultSignals = (): DegradationSignal[] => {
    const signals: DegradationSignal[] = [new BatterySignal(), getWebrtcCpuSignal()];
    if (import.meta.env.DEV) signals.push(new DebugSignal());
    return signals;
};
