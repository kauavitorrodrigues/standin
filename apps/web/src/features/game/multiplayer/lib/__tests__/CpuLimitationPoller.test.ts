import { describe, expect, it, vi } from "vitest";
import { CpuLimitationPoller } from "../CpuLimitationPoller";

const fakeSender = (stats: () => Record<string, unknown>) =>
    ({
        getStats: vi.fn(async () => new Map([["out", stats()]])),
    }) as unknown as RTCRtpSender & { getStats: ReturnType<typeof vi.fn> };

describe("CpuLimitationPoller", () => {
    it("does not call getStats without video senders", async () => {
        const onSample = vi.fn();
        const poller = new CpuLimitationPoller({ getVideoSenders: () => [], onSample });
        await poller.poll();
        expect(onSample).not.toHaveBeenCalled();
    });

    it("reports the delta of cpu limited seconds when the reason is cpu", async () => {
        let cpu = 4;
        const sender = fakeSender(() => ({
            type: "outbound-rtp",
            qualityLimitationReason: "cpu",
            qualityLimitationDurations: { cpu },
        }));
        const onSample = vi.fn();
        const poller = new CpuLimitationPoller({ getVideoSenders: () => [sender], onSample });
        poller.start();
        await poller.poll();
        cpu = 10;
        await poller.poll();
        poller.stop();
        expect(onSample).toHaveBeenNthCalledWith(1, { reason: "cpu", cpuLimitedDuration: 4 });
    });

    it("reports 0 when the reason is not cpu", async () => {
        const sender = fakeSender(() => ({
            type: "outbound-rtp",
            qualityLimitationReason: "bandwidth",
            qualityLimitationDurations: { cpu: 3 },
        }));
        const onSample = vi.fn();
        const poller = new CpuLimitationPoller({ getVideoSenders: () => [sender], onSample });
        poller.start();
        await poller.poll();
        poller.stop();
        expect(onSample).toHaveBeenCalledWith({ reason: "none", cpuLimitedDuration: 0 });
    });

    it("polls on the interval", async () => {
        vi.useFakeTimers();
        const sender = fakeSender(() => ({ type: "outbound-rtp" }));
        const poller = new CpuLimitationPoller({
            getVideoSenders: () => [sender],
            onSample: vi.fn(),
        });
        poller.start();
        await vi.advanceTimersByTimeAsync(10000);
        poller.stop();
        expect(sender.getStats).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });
});
