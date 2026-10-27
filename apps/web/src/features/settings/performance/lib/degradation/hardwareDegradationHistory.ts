// Window and threshold: two hardware-limited degradations within 4 hours
// make it permanent.
export const HARDWARE_DEGRADATION_WINDOW_MS = 4 * 60 * 60 * 1000;
export const HARDWARE_DEGRADATION_PROMOTE_COUNT = 2;

// Start times of hardware-limited degradations (battery is never recorded).
export class HardwareDegradationHistory {
    private starts: number[] = [];

    // Records a start and returns how many fall inside the window, itself
    // included. Older starts are dropped.
    record(now: number): number {
        this.starts = this.starts.filter(
            (start) => now - start < HARDWARE_DEGRADATION_WINDOW_MS
        );
        this.starts.push(now);
        return this.starts.length;
    }

    reset() {
        this.starts = [];
    }
}
