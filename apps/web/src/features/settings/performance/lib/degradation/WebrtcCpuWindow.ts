import { DegradationSeverity } from "./DegradationSeverity";

// Thresholds and window. The summed cpuLimitedDuration inside the window degrades at
// 20 or more and recovers at 5 or less. Anything in between keeps the state.
export const CPU_LIMITATION_WINDOW_MS = 60000;
export const CPU_LIMITATION_DEGRADE_THRESHOLD = 20;
export const CPU_LIMITATION_RECOVER_THRESHOLD = 5;
// Without a new event for this long, the records are dropped and the state
// is forced back to None. Same 60 s as the window.
export const CPU_LIMITATION_NO_EVENTS_TIMEOUT_MS = 60000;

type CpuLimitationRecord = {
    timestamp: number;
    cpuLimitedDuration: number;
};

// Pure sliding window with an injected clock, so tests never need real time.
export class WebrtcCpuWindow {
    private records: CpuLimitationRecord[] = [];
    private lastEventAt: number | null = null;
    private severity: DegradationSeverity = DegradationSeverity.None;

    private readonly now: () => number;

    constructor(now: () => number = () => Date.now()) {
        this.now = now;
    }

    get current(): DegradationSeverity {
        return this.severity;
    }

    // Duration is in seconds, 0 when the limitation reason is not cpu.
    record(cpuLimitedDuration: number): DegradationSeverity {
        const timestamp = this.now();
        this.lastEventAt = timestamp;
        this.records.push({ timestamp, cpuLimitedDuration });
        return this.updateSeverity(this.total());
    }

    // True when the silence timeout has elapsed. In that case the records
    // are cleared and the state is forced to None.
    expireIfSilent(): DegradationSeverity {
        if (this.lastEventAt === null) return this.severity;
        if (this.now() - this.lastEventAt < CPU_LIMITATION_NO_EVENTS_TIMEOUT_MS) {
            return this.severity;
        }
        return this.reset();
    }

    reset(): DegradationSeverity {
        this.records = [];
        this.lastEventAt = null;
        this.severity = DegradationSeverity.None;
        return this.severity;
    }

    private total(): number {
        const cutoff = this.now() - CPU_LIMITATION_WINDOW_MS;
        this.records = this.records.filter((entry) => entry.timestamp > cutoff);
        return this.records.reduce((sum, entry) => sum + entry.cpuLimitedDuration, 0);
    }

    private updateSeverity(total: number): DegradationSeverity {
        if (total >= CPU_LIMITATION_DEGRADE_THRESHOLD) {
            this.severity = DegradationSeverity.Degraded;
        } else if (total <= CPU_LIMITATION_RECOVER_THRESHOLD) {
            this.severity = DegradationSeverity.None;
        }
        return this.severity;
    }
}
