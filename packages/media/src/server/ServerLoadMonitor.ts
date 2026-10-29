import { SERVER_LOAD } from "../consts/server";

/**
 * Turns the CPU time of the media worker into how many videos of each receiver
 * the server holds back. The worker uses one core, so a share of 1 means it is
 * out of room.
 *
 * Above the high share for a hold time, one more video is held back, and again
 * for each hold time it stays there. Below the low share for a hold time, one
 * is given back. In between nothing changes, so a load that hovers does not
 * make the videos come and go.
 */
export class ServerLoadMonitor {
    private level = 0;
    private lastCpuSeconds: number | null = null;
    private lastAt = 0;
    // Since when the share has been past the line that would change the level,
    // in one direction. Null while it is not.
    private pastSince: { direction: "up" | "down"; at: number } | null = null;

    /** The videos held back now. */
    get shed(): number {
        return this.level;
    }

    /**
     * Takes one reading and says the level it leads to.
     *
     * @param cpuSeconds CPU time the worker has used since it started.
     * @param nowMs Clock of the reading, in ms.
     */
    observe(cpuSeconds: number, nowMs: number): number {
        let previous = this.lastCpuSeconds;
        // The CPU time only grows, so a lower value is a worker that started
        // again, with a new count and nothing held back.
        if (previous !== null && cpuSeconds < previous) {
            this.reset();
            previous = null;
        }
        const elapsedMs = nowMs - this.lastAt;
        this.lastCpuSeconds = cpuSeconds;
        this.lastAt = nowMs;
        if (previous === null || elapsedMs <= 0) return this.level;

        const share = (cpuSeconds - previous) / (elapsedMs / 1000);
        this.follow(share, nowMs);
        return this.level;
    }

    /** Forgets what it saw, for a worker that started again. */
    reset(): void {
        this.level = 0;
        this.lastCpuSeconds = null;
        this.pastSince = null;
    }

    private follow(share: number, nowMs: number): void {
        const direction =
            share > SERVER_LOAD.HIGH_CPU_SHARE
                ? "up"
                : share < SERVER_LOAD.LOW_CPU_SHARE
                  ? "down"
                  : null;
        const blocked =
            (direction === "up" && this.level >= SERVER_LOAD.MAX_SHED) ||
            (direction === "down" && this.level <= 0);
        if (direction === null || blocked) {
            this.pastSince = null;
            return;
        }

        if (this.pastSince?.direction !== direction) {
            this.pastSince = { direction, at: nowMs };
            return;
        }
        if (nowMs - this.pastSince.at < SERVER_LOAD.HOLD_MS) return;

        this.level += direction === "up" ? 1 : -1;
        // Another step needs another whole hold time.
        this.pastSince = { direction, at: nowMs };
    }
}
