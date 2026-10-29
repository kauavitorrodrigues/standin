import { afterEach, describe, expect, it, vi } from "vitest";
import { BatterySignal, getBatterySeverity } from "../BatterySignal";
import { DegradationMonitor } from "../DegradationMonitor";
import { DebugSignal } from "../DebugSignal";
import { WebrtcCpuSignal, getWebrtcCpuSignal } from "../WebrtcCpuSignal";
import { WebrtcCpuWindow } from "../WebrtcCpuWindow";
import { DegradationSeverity } from "../DegradationSeverity";
import type { DegradationSignal } from "../DegradationSignal";

const createFakeSignal = (severity: DegradationSeverity): DegradationSignal => ({
    id: "fake",
    severity,
    isHardwarePerformanceLimited: false,
    start: vi.fn(),
    stop: vi.fn(),
    subscribe: () => () => {},
});

const createFakeBattery = (charging: boolean, level: number) => {
    const target = new EventTarget() as EventTarget & { charging: boolean; level: number };
    target.charging = charging;
    target.level = level;
    return target;
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("DegradationMonitor", () => {
    it("returns the max severity of its signals", () => {
        const none = createFakeSignal(DegradationSeverity.None);
        const degraded = createFakeSignal(DegradationSeverity.Degraded);
        expect(new DegradationMonitor([]).getSeverity()).toBe(DegradationSeverity.None);
        expect(new DegradationMonitor([none, none]).getSeverity()).toBe(DegradationSeverity.None);
        expect(new DegradationMonitor([none, degraded, none]).getSeverity()).toBe(DegradationSeverity.Degraded);
    });

    it("starts signals on first subscriber and stops on last", () => {
        const signal = createFakeSignal(DegradationSeverity.None);
        const monitor = new DegradationMonitor([signal]);
        const unsubscribe = monitor.subscribe(() => {});
        expect(signal.start).toHaveBeenCalledTimes(1);
        unsubscribe();
        expect(signal.stop).toHaveBeenCalledTimes(1);
    });
});

describe("battery thresholds", () => {
    it("degrades at 0.15 only when not charging", () => {
        expect(getBatterySeverity({ charging: false, level: 0.15 })).toBe(DegradationSeverity.Degraded);
        expect(getBatterySeverity({ charging: false, level: 0.16 })).toBe(DegradationSeverity.None);
        expect(getBatterySeverity({ charging: true, level: 0.15 })).toBe(DegradationSeverity.None);
        expect(getBatterySeverity({ charging: true, level: 0.05 })).toBe(DegradationSeverity.None);
    });
});

describe("BatterySignal", () => {
    it("does not throw when getBattery is absent", () => {
        vi.stubGlobal("navigator", {});
        const signal = new BatterySignal();
        expect(() => signal.start()).not.toThrow();
        expect(signal.severity).toBe(DegradationSeverity.None);
        expect(() => signal.stop()).not.toThrow();
    });

    it("reacts immediately to level and charging changes", async () => {
        const battery = createFakeBattery(false, 0.5);
        vi.stubGlobal("navigator", { getBattery: () => Promise.resolve(battery) });
        const signal = new BatterySignal();
        const listener = vi.fn();
        signal.subscribe(listener);
        signal.start();
        await Promise.resolve();
        expect(signal.severity).toBe(DegradationSeverity.None);

        battery.level = 0.15;
        battery.dispatchEvent(new Event("levelchange"));
        expect(signal.severity).toBe(DegradationSeverity.Degraded);

        battery.charging = true;
        battery.dispatchEvent(new Event("chargingchange"));
        expect(signal.severity).toBe(DegradationSeverity.None);
        expect(listener).toHaveBeenCalledTimes(2);
        expect(signal.isHardwarePerformanceLimited).toBe(false);
    });
});

describe("WebrtcCpuWindow", () => {
    const createWindow = () => {
        let now = 0;
        const window = new WebrtcCpuWindow(() => now);
        return { window, advance: (ms: number) => (now += ms) };
    };

    it("degrades at 20 and recovers at 5", () => {
        const { window, advance } = createWindow();
        expect(window.record(19)).toBe(DegradationSeverity.None);
        advance(5000);
        expect(window.record(1)).toBe(DegradationSeverity.Degraded);
        advance(61000);
        expect(window.record(5)).toBe(DegradationSeverity.None);
    });

    it("keeps the state between 6 and 19", () => {
        const { window, advance } = createWindow();
        expect(window.record(10)).toBe(DegradationSeverity.None);
        window.record(10);
        expect(window.current).toBe(DegradationSeverity.Degraded);
        advance(61000);
        expect(window.record(6)).toBe(DegradationSeverity.Degraded);
        advance(61000);
        expect(window.record(19)).toBe(DegradationSeverity.Degraded);
    });

    it("forces None after 60 s of silence", () => {
        const { window, advance } = createWindow();
        window.record(25);
        advance(59999);
        expect(window.expireIfSilent()).toBe(DegradationSeverity.Degraded);
        advance(1);
        expect(window.expireIfSilent()).toBe(DegradationSeverity.None);
    });
});

describe("WebrtcCpuSignal", () => {
    it("is hardware limited and ignores non cpu reasons", () => {
        const signal = new WebrtcCpuSignal();
        expect(signal.isHardwarePerformanceLimited).toBe(true);
        signal.handleQualityLimitation({ reason: "bandwidth", cpuLimitedDuration: 30 });
        expect(signal.severity).toBe(DegradationSeverity.None);
        signal.handleQualityLimitation({ reason: "cpu", cpuLimitedDuration: 20 });
        expect(signal.severity).toBe(DegradationSeverity.Degraded);
        signal.stop();
    });

    it("clears to None when no event arrives for 60 s", () => {
        vi.useFakeTimers();
        const signal = new WebrtcCpuSignal();
        signal.handleQualityLimitation({ reason: "cpu", cpuLimitedDuration: 20 });
        vi.advanceTimersByTime(59999);
        expect(signal.severity).toBe(DegradationSeverity.Degraded);
        vi.advanceTimersByTime(1);
        expect(signal.severity).toBe(DegradationSeverity.None);
        vi.useRealTimers();
    });

    it("is registered in the default monitor", () => {
        expect(getWebrtcCpuSignal().id).toBe("webrtcCpuLimitation");
    });
});

describe("DebugSignal", () => {
    afterEach(() => {
        getWebrtcCpuSignal().stop();
    });

    it("__degradeCpu goes through the real cpu window", () => {
        const debug = new DebugSignal();
        debug.start();
        const cpuSignal = getWebrtcCpuSignal();
        window.__degradeCpu?.(10);
        expect(cpuSignal.severity).toBe(DegradationSeverity.None);
        window.__degradeCpu?.(10);
        expect(cpuSignal.severity).toBe(DegradationSeverity.Degraded);
        debug.stop();
        expect(window.__degradeCpu).toBeUndefined();
    });
});
