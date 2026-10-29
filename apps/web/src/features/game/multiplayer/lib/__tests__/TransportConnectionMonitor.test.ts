import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ICE_DISCONNECTED_GRACE_MS } from "../../consts/connection";
import {
    TransportConnectionMonitor,
    TransportErrorType,
} from "../TransportConnectionMonitor";

const setup = () => {
    const onError = vi.fn();
    const onGraceExpired = vi.fn();
    const monitor = new TransportConnectionMonitor({
        id: "t1",
        onError,
        onGraceExpired,
    });
    return { monitor, onError, onGraceExpired };
};

describe("TransportConnectionMonitor", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("grace period is 10 seconds", () => {
        expect(ICE_DISCONNECTED_GRACE_MS).toBe(10000);
    });

    it("ignores disconnected before the first connect and starts no timer", () => {
        const { monitor, onError, onGraceExpired } = setup();

        monitor.onConnectionStateChanged("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS * 2);

        expect(onError).not.toHaveBeenCalled();
        expect(onGraceExpired).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
    });

    it("publishes FailedState immediately with the payload", () => {
        const { monitor, onError } = setup();

        monitor.onConnectionStateChanged("failed");

        expect(onError).toHaveBeenCalledWith(TransportErrorType.FailedState, {
            id: "t1",
            connectionState: "failed",
        });
    });

    it("a second quick disconnect publishes UnstableConnection", () => {
        const { monitor, onError } = setup();

        monitor.onConnectionStateChanged("connected");
        monitor.onConnectionStateChanged("disconnected");
        expect(onError).not.toHaveBeenCalled();

        monitor.onConnectionStateChanged("connected");
        monitor.onConnectionStateChanged("disconnected");
        expect(onError).toHaveBeenCalledWith(
            TransportErrorType.UnstableConnection,
            { id: "t1", connectionState: "disconnected" }
        );
    });

    it("a disconnect after the grace period resets the quick flag", () => {
        const { monitor, onError } = setup();

        monitor.onConnectionStateChanged("connected");
        monitor.onConnectionStateChanged("disconnected");
        monitor.onConnectionStateChanged("connected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS + 1);
        monitor.onConnectionStateChanged("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS);

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(
            TransportErrorType.Disconnected,
            expect.anything()
        );
    });

    it("keeps one pending timer and does not restart it", () => {
        const { monitor, onError, onGraceExpired } = setup();

        monitor.onConnectionStateChanged("connected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS + 1);
        monitor.onConnectionStateChanged("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS - 1);
        monitor.onConnectionStateChanged("disconnected");
        vi.advanceTimersByTime(1);

        expect(onGraceExpired).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it("does nothing on expiry when it recovered, and clears the timer", () => {
        const { monitor, onError, onGraceExpired } = setup();

        monitor.onConnectionStateChanged("connected");
        monitor.onConnectionStateChanged("disconnected");
        monitor.onConnectionStateChanged("connected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS * 2);

        expect(onError).not.toHaveBeenCalled();
        expect(onGraceExpired).not.toHaveBeenCalled();
    });

    it("previously connected expires as Disconnected", () => {
        const { monitor, onError } = setup();

        monitor.onConnectionStateChanged("connected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS + 1);
        monitor.onConnectionStateChanged("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS);

        expect(onError).toHaveBeenCalledWith(TransportErrorType.Disconnected, {
            id: "t1",
            connectionState: "disconnected",
        });
    });

    it("quick disconnect that never recovers expires as UnstableConnection", () => {
        const { monitor, onError } = setup();

        monitor.onConnectionStateChanged("connected");
        monitor.onConnectionStateChanged("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS);

        expect(onError).toHaveBeenCalledWith(
            TransportErrorType.UnstableConnection,
            expect.anything()
        );
    });

    it("classifies a never-connected expiry by reason", () => {
        // lastConnectedAt stays 0 only if the disconnected is ignored, so
        // the never-connected branch is reached through the private timer
        // by forcing a pending timer with a connected-then-reset monitor.
        const initial = setup();
        const restart = setup();
        for (const { monitor, reason } of [
            { monitor: initial.monitor, reason: "initialConnect" as const },
            { monitor: restart.monitor, reason: "iceRestart" as const },
        ]) {
            monitor.setMonitorReason(reason);
            const internals = monitor as unknown as {
                lastConnectedAt: number;
                startTimerIfNeeded: () => void;
            };
            internals.lastConnectedAt = 0;
            internals.startTimerIfNeeded();
        }
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS);

        expect(initial.onError).toHaveBeenCalledWith(
            TransportErrorType.FailedToConnect,
            expect.anything()
        );
        expect(restart.onError).toHaveBeenCalledWith(
            TransportErrorType.ICERestartFailure,
            expect.anything()
        );
    });

    it("adds what the socket was doing to the warning of an error", () => {
        const report = {
            connected: false,
            lastConnectAt: 1,
            lastDisconnectAt: 2,
            lastDisconnectReason: "ping timeout",
            pingIntervalMs: 25000,
            pingTimeoutMs: 20000,
        };
        const monitor = new TransportConnectionMonitor({
            id: "t1",
            onError: vi.fn(),
            describeConnection: () => report,
        });

        monitor.onConnectionStateChanged("failed");

        expect(console.warn).toHaveBeenCalledWith(
            "[multiplayer] transport error",
            TransportErrorType.FailedState,
            { id: "t1", connectionState: "failed" },
            report
        );
    });
});
