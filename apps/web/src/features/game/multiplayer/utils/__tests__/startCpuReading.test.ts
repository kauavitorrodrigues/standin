import { afterEach, describe, expect, it, vi } from "vitest";
import { startCpuReading } from "../startCpuReading";
import type { SfuSupervisor } from "../../lib/SfuSupervisor";
import { getWebrtcCpuSignal } from "@/features/settings/performance/lib/degradation/WebrtcCpuSignal";
import { DegradationSeverity } from "@/features/settings/performance/lib/degradation/DegradationSeverity";

const cpuLimitedSender = (cpu: () => number) =>
    ({
        getStats: vi.fn(
            async () =>
                new Map([
                    [
                        "out",
                        {
                            type: "outbound-rtp",
                            qualityLimitationReason: "cpu",
                            qualityLimitationDurations: { cpu: cpu() },
                        },
                    ],
                ])
        ),
    }) as unknown as RTCRtpSender;

const fakeSupervisor = (senders: RTCRtpSender[]) => {
    const setLowQuality = vi.fn();
    const supervisor = {
        getVideoSenders: () => senders,
        setLowQuality,
    } as unknown as SfuSupervisor;
    return { supervisor, setLowQuality };
};

describe("startCpuReading", () => {
    afterEach(() => {
        getWebrtcCpuSignal().stop();
        vi.useRealTimers();
    });

    it("reads the send path and drives the shared degradation signal", async () => {
        vi.useFakeTimers();
        let cpu = 0;
        const { supervisor } = fakeSupervisor([cpuLimitedSender(() => cpu)]);
        const stop = startCpuReading(supervisor);

        cpu = 25;
        await vi.advanceTimersByTimeAsync(5000);
        expect(getWebrtcCpuSignal().severity).toBe(DegradationSeverity.Degraded);
        stop();
    });

    it("asks for the current quality at once and stops polling when disconnected", async () => {
        vi.useFakeTimers();
        const sender = cpuLimitedSender(() => 0);
        const { supervisor, setLowQuality } = fakeSupervisor([sender]);
        const stop = startCpuReading(supervisor);
        expect(setLowQuality).toHaveBeenCalledWith(false);

        stop();
        await vi.advanceTimersByTimeAsync(20000);
        expect(sender.getStats).not.toHaveBeenCalled();
    });
});
