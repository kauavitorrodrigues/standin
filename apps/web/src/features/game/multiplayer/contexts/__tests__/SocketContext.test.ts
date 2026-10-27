// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { fakeSocket, handlers } = vi.hoisted(() => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    const fakeSocket = {
        connected: false,
        io: { engine: { transport: { name: "websocket" } } },
        on: (event: string, handler: (...args: unknown[]) => void) => {
            handlers.set(event, handler);
        },
        off: (event: string) => {
            handlers.delete(event);
        },
    };
    return { fakeSocket, handlers };
});

vi.mock("../../socket", () => ({ socket: fakeSocket }));
vi.mock("@/components/ui/toast", () => ({ toast: { add: vi.fn() } }));

import { SocketProvider } from "../SocketContext";
import { useSocket, type ConnectionReport } from "../../hooks/useSocket";

describe("SocketProvider connection report", () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    });
    afterEach(() => vi.useRealTimers());

    it("exposes isConnected, last connect/disconnect times and transport", () => {
        const report: { current: ConnectionReport | null } = { current: null };
        const Probe = (): ReactNode => {
            report.current = useSocket().connectionReport;
            return null;
        };
        const root = createRoot(document.createElement("div"));
        act(() =>
            root.render(
                createElement(SocketProvider, null, createElement(Probe))
            )
        );

        expect(report.current).toEqual({
            isConnected: false,
            lastConnectedAt: null,
            lastDisconnectedAt: null,
            transport: "websocket",
        });

        const connectedAt = Date.now();
        act(() => handlers.get("connect")?.());
        expect(report.current?.isConnected).toBe(true);
        expect(report.current?.lastConnectedAt).toBe(connectedAt);

        vi.advanceTimersByTime(5000);
        const disconnectedAt = Date.now();
        act(() => handlers.get("disconnect")?.("transport close"));
        expect(report.current).toEqual({
            isConnected: false,
            lastConnectedAt: connectedAt,
            lastDisconnectedAt: disconnectedAt,
            transport: "N/A",
        });

        act(() => root.unmount());
    });
});
