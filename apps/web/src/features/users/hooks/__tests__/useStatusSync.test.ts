// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const listeners = new Map<string, (payload?: unknown) => void>();
const socketListeners = new Map<string, () => void>();
const { emitSetStatus, toastAdd, clearCustomStatus, userStatus } = vi.hoisted(
    () => ({
        emitSetStatus: vi.fn(),
        toastAdd: vi.fn(),
        clearCustomStatus: vi.fn(),
        userStatus: {
            current: {
                status: "active" as string,
                customStatus: null as null | {
                    text: string;
                    emoji: string;
                    expiresAt: number | null;
                },
            },
        },
    })
);

vi.mock("@/features/game/multiplayer/hooks/useSocketEvent", async () => {
    const { useEffect } = await import("react");
    return {
        useSocketEvent: (event: string, handler: (payload?: unknown) => void) =>
            useEffect(() => {
                listeners.set(event, handler);
            }),
    };
});
vi.mock("@/features/game/multiplayer/socket", () => ({
    socket: {
        on: (event: string, handler: () => void) =>
            socketListeners.set(event, handler),
        off: (event: string) => socketListeners.delete(event),
    },
}));
vi.mock("../../lib/emitSetStatus", () => ({
    emitSetStatus: (status: unknown) => emitSetStatus(status),
}));
vi.mock("../useIdleDetection", () => ({ useIdleDetection: () => undefined }));
vi.mock("../useUserStatus", () => ({
    useUserStatus: () => ({ ...userStatus.current, clearCustomStatus }),
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: toastAdd } }));

import { useStatusSync } from "../useStatusSync";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const mount = () => {
    const force: { current: () => void } = { current: () => undefined };
    const view = renderHook(() => {
        const [, setTick] = useState(0);
        force.current = () => setTick((tick) => tick + 1);
        useStatusSync();
    });
    return { ...view, rerender: () => view.act(() => force.current()) };
};

beforeEach(() => {
    listeners.clear();
    socketListeners.clear();
    emitSetStatus.mockReset();
    emitSetStatus.mockResolvedValue({ ok: true });
    toastAdd.mockReset();
    clearCustomStatus.mockReset();
    userStatus.current = { status: "active", customStatus: null };
});
afterEach(unmountAllHooks);

describe("useStatusSync", () => {
    it("sends nothing before the first join", async () => {
        const { act } = mount();

        await act(flush);

        expect(emitSetStatus).not.toHaveBeenCalled();
    });

    it("sends the status again on every join", async () => {
        const { act } = mount();

        await act(async () => {
            listeners.get("space:joined")?.();
            await flush();
        });
        await act(async () => {
            listeners.get("space:joined")?.();
            await flush();
        });

        expect(emitSetStatus).toHaveBeenCalledTimes(2);
        expect(emitSetStatus).toHaveBeenLastCalledWith({
            availability: "active",
            customStatus: null,
        });
    });

    it("announces away but never busy", async () => {
        userStatus.current = { status: "busy", customStatus: null };
        const { act } = mount();

        await act(async () => {
            listeners.get("space:joined")?.();
            await flush();
        });

        expect(emitSetStatus).toHaveBeenLastCalledWith({
            availability: "active",
            customStatus: null,
        });
    });

    it("sends a change while joined and nothing after a disconnect", async () => {
        const { act, rerender } = mount();
        await act(async () => {
            listeners.get("space:joined")?.();
            await flush();
        });
        emitSetStatus.mockClear();

        userStatus.current = { status: "away", customStatus: null };
        rerender();
        await act(flush);
        expect(emitSetStatus).toHaveBeenCalledTimes(1);

        act(() => socketListeners.get("disconnect")?.());
        userStatus.current = { status: "active", customStatus: null };
        rerender();
        await act(flush);

        expect(emitSetStatus).toHaveBeenCalledTimes(1);
    });

    it("never sends a custom status that already ended", async () => {
        userStatus.current = {
            status: "active",
            customStatus: {
                text: "Lunch",
                emoji: "🍕",
                expiresAt: Date.now() - 60_000,
            },
        };
        const { act } = mount();

        await act(async () => {
            listeners.get("space:joined")?.();
            await flush();
        });

        expect(emitSetStatus).toHaveBeenLastCalledWith({
            availability: "active",
            customStatus: null,
        });
        expect(clearCustomStatus).toHaveBeenCalled();
        expect(toastAdd).not.toHaveBeenCalled();
    });

    it("tells the person once when the server refuses", async () => {
        emitSetStatus.mockResolvedValue({ ok: false, code: "STATUS_INVALID" });
        const { act } = mount();

        await act(async () => {
            listeners.get("space:joined")?.();
            await flush();
        });

        expect(toastAdd).toHaveBeenCalledTimes(1);
        expect(toastAdd).toHaveBeenCalledWith(
            expect.objectContaining({ type: "error" })
        );
    });

    it("tells the person once when the server does not answer", async () => {
        emitSetStatus.mockRejectedValue(new Error("timeout"));
        const { act } = mount();

        await act(async () => {
            listeners.get("space:joined")?.();
            await flush();
        });

        expect(toastAdd).toHaveBeenCalledTimes(1);
    });
});
