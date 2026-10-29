import { CPU_LIMITATION_POLL_INTERVAL_MS } from "../consts/stats";

export type CpuLimitationSample = {
    reason: string;
    cpuLimitedDuration: number;
    // Share of the time since the previous poll spent limited by the cpu, from
    // 0 to 100. Reported for diagnosis, no threshold reads it.
    cpuLimitedPercentage: number;
};

export type CpuLimitationPollerOptions = {
    getVideoSenders: () => RTCRtpSender[];
    onSample: (sample: CpuLimitationSample) => void;
    intervalMs?: number;
    now?: () => number;
};

type OutboundStats = {
    type: string;
    qualityLimitationReason?: string;
    qualityLimitationDurations?: { cpu?: number };
};

// Polls getStats() on the local video senders and turns outbound-rtp
// qualityLimitation* into the event shape the WebrtcCpuSignal consumes.
// cpuLimitedDuration is the delta of qualityLimitationDurations.cpu in
// seconds since the previous poll, 0 when the reason is not cpu. The
// derivation is ours.
// Separate from PeerLink so SfuClient can reuse it with its own senders.
export class CpuLimitationPoller {
    private timer: ReturnType<typeof setInterval> | null = null;
    private previousCpu = new WeakMap<RTCRtpSender, number>();
    private polling = false;
    private lastPollAt: number | null = null;
    private readonly options: CpuLimitationPollerOptions;

    constructor(options: CpuLimitationPollerOptions) {
        this.options = options;
    }

    start(): void {
        if (this.timer) return;
        this.timer = setInterval(
            () => void this.poll(),
            this.options.intervalMs ?? CPU_LIMITATION_POLL_INTERVAL_MS
        );
    }

    stop(): void {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
        this.lastPollAt = null;
    }

    async poll(): Promise<void> {
        if (this.polling) return;
        const senders = this.options.getVideoSenders();
        if (senders.length === 0) return;

        this.polling = true;
        try {
            const sample = await this.collect(senders);
            if (this.timer) this.options.onSample(sample);
        } catch (error) {
            console.warn("[multiplayer] failed to read sender stats", error);
        } finally {
            this.polling = false;
        }
    }

    private async collect(senders: RTCRtpSender[]): Promise<CpuLimitationSample> {
        const now = (this.options.now ?? Date.now)();
        const elapsedSeconds =
            ((this.lastPollAt === null
                ? (this.options.intervalMs ?? CPU_LIMITATION_POLL_INTERVAL_MS)
                : now - this.lastPollAt)) / 1000;
        this.lastPollAt = now;

        let reason = "none";
        let cpuLimitedDuration = 0;

        for (const sender of senders) {
            const report = await sender.getStats();
            report.forEach((stat: OutboundStats) => {
                if (stat.type !== "outbound-rtp") return;

                const cpu = stat.qualityLimitationDurations?.cpu ?? 0;
                const delta = Math.max(0, cpu - (this.previousCpu.get(sender) ?? 0));
                this.previousCpu.set(sender, cpu);
                if (stat.qualityLimitationReason !== "cpu") return;

                reason = "cpu";
                cpuLimitedDuration += delta;
            });
        }
        const cpuLimitedPercentage =
            elapsedSeconds > 0
                ? Math.min(100, (cpuLimitedDuration / elapsedSeconds) * 100)
                : 0;
        return { reason, cpuLimitedDuration, cpuLimitedPercentage };
    }
}
