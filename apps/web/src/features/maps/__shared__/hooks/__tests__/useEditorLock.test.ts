// @vitest-environment jsdom
import { act, createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCK_HEARTBEAT_MS } from "@standin/contracts";
import { LOCK_STATUS } from "@/features/maps/__shared__/consts/lock-status";
import { useEditorLock } from "@/features/maps/__shared__/hooks/useEditorLock";
import type { EditorLockControl } from "@/features/maps/__shared__/types/EditorLockControl";
import type { LockStatus } from "@/features/maps/__shared__/types/lock-status";

type Handler = (...args: unknown[]) => void;

const fakeSocket = vi.hoisted(() => {
    const listeners = new Map<string, Set<Handler>>();
    const timedEmit = vi.fn();
    return {
        listeners,
        emit: vi.fn(),
        timedEmit,
        timeout: () => ({ emit: timedEmit }),
        on: (event: string, handler: Handler) => {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event)?.add(handler);
        },
        off: (event: string, handler: Handler) => {
            listeners.get(event)?.delete(handler);
        },
    };
});

vi.mock("@/features/realtime/socket", () => ({
    realtimeSocket: fakeSocket,
}));

const MAP_ID = "map-1";
const SESSION_ID = "session-1";

let root: Root;
let latest: LockStatus;
let latestControl: EditorLockControl;
const onAcquired = vi.fn();

const Probe = () => {
    const { lock, control } = useEditorLock(MAP_ID, SESSION_ID, onAcquired);
    useEffect(() => {
        latest = lock;
        latestControl = control;
    }, [lock, control]);
    return null;
};

const mount = () => {
    act(() => {
        root.render(createElement(Probe));
    });
};

const emitsOf = (event: string) =>
    fakeSocket.emit.mock.calls.filter((call) => call[0] === event);

const answerAcquire = (response: unknown) => {
    const call = emitsOf("editor:acquire")[0];
    act(() => {
        call[2](response);
    });
};

const GRANTED = { ok: true, heartbeatMs: LOCK_HEARTBEAT_MS, ttlMs: 45000 };

describe("useEditorLock", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.useFakeTimers();
        fakeSocket.emit.mockReset();
        fakeSocket.timedEmit.mockReset();
        onAcquired.mockReset();
        fakeSocket.listeners.clear();
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("acquires on mount and holds when granted", () => {
        mount();
        expect(latest.status).toBe(LOCK_STATUS.ACQUIRING);
        expect(emitsOf("editor:acquire")[0][1]).toEqual({
            mapId: MAP_ID,
            sessionId: SESSION_ID,
        });

        answerAcquire(GRANTED);
        expect(latest.status).toBe(LOCK_STATUS.HELD);
    });

    it("is denied with who holds it and since when", () => {
        mount();
        answerAcquire({
            ok: false,
            code: "MAP_LOCKED",
            by: { id: "u1", name: "Ana" },
            since: "2026-01-01T00:00:00.000Z",
        });
        expect(latest).toMatchObject({
            status: LOCK_STATUS.DENIED,
            by: { id: "u1", name: "Ana" },
            since: "2026-01-01T00:00:00.000Z",
        });
        expect(emitsOf("editor:heartbeat")).toHaveLength(0);
    });

    it("repeats the heartbeat on the interval", () => {
        mount();
        answerAcquire(GRANTED);

        act(() => {
            vi.advanceTimersByTime(LOCK_HEARTBEAT_MS * 3);
        });
        expect(emitsOf("editor:heartbeat")).toHaveLength(3);
    });

    it("releases on unmount", () => {
        mount();
        answerAcquire(GRANTED);
        act(() => root.unmount());
        expect(emitsOf("editor:release")).toHaveLength(1);
        root = createRoot(document.createElement("div"));
    });

    it("goes to lost on editor:lock_lost", () => {
        mount();
        answerAcquire(GRANTED);
        act(() => {
            fakeSocket.listeners
                .get("editor:lock_lost")
                ?.forEach((handler) => handler({ mapId: MAP_ID }));
        });
        expect(latest.status).toBe(LOCK_STATUS.LOST);
    });

    it("goes to lost when the heartbeat answers ok false", () => {
        mount();
        answerAcquire(GRANTED);
        act(() => {
            vi.advanceTimersByTime(LOCK_HEARTBEAT_MS);
        });
        const heartbeat = emitsOf("editor:heartbeat")[0];
        act(() => {
            heartbeat[2]({ ok: false });
        });
        expect(latest.status).toBe(LOCK_STATUS.LOST);

        act(() => {
            vi.advanceTimersByTime(LOCK_HEARTBEAT_MS * 2);
        });
        expect(emitsOf("editor:heartbeat")).toHaveLength(1);
    });
    it("calls onAcquired only when the lock is granted", () => {
        mount();
        answerAcquire(GRANTED);
        expect(onAcquired).toHaveBeenCalledTimes(1);
    });

    it("shows who holds it and never releases a lock it did not get", () => {
        mount();
        answerAcquire({ ok: false, code: "MAP_LOCKED" });
        expect(onAcquired).not.toHaveBeenCalled();

        act(() => root.unmount());
        expect(emitsOf("editor:release")).toHaveLength(0);
        root = createRoot(document.createElement("div"));
    });

    it("is denied for lack of permission", () => {
        mount();
        answerAcquire({ ok: false, code: "FORBIDDEN" });
        expect(latest).toMatchObject({
            status: LOCK_STATUS.DENIED,
            code: "FORBIDDEN",
        });
    });

    it("releases on unmount even while the answer is pending", () => {
        mount();
        act(() => root.unmount());
        expect(emitsOf("editor:release")).toHaveLength(1);
        root = createRoot(document.createElement("div"));
    });

    it("releases once when it released before leaving", () => {
        mount();
        answerAcquire(GRANTED);
        act(() => {
            void latestControl.release();
        });
        act(() => root.unmount());
        expect(fakeSocket.timedEmit).toHaveBeenCalledTimes(1);
        expect(emitsOf("editor:release")).toHaveLength(0);
        root = createRoot(document.createElement("div"));
    });

    it("waits for the answer of the release and never asks twice", async () => {
        mount();
        answerAcquire(GRANTED);

        let done = false;
        const first = latestControl.release().then(() => {
            done = true;
        });
        await Promise.resolve();
        expect(done).toBe(false);
        expect(fakeSocket.timedEmit.mock.calls[0][0]).toBe("editor:release");

        fakeSocket.timedEmit.mock.calls[0][2](null, undefined);
        await first;
        expect(done).toBe(true);

        await latestControl.release();
        expect(fakeSocket.timedEmit).toHaveBeenCalledTimes(1);
    });

    it("marks the lock lost and gets it back with a restore", () => {
        mount();
        answerAcquire(GRANTED);

        act(() => latestControl.markLost());
        expect(latest.status).toBe(LOCK_STATUS.LOST);

        act(() => latestControl.restore());
        expect(latest.status).toBe(LOCK_STATUS.HELD);
    });

    it("asks again with a timeout and answers null when the server is silent", async () => {
        mount();
        answerAcquire(GRANTED);

        const pending = latestControl.reacquire();
        const call = fakeSocket.timedEmit.mock.calls[0];
        expect(call[0]).toBe("editor:acquire");
        expect(call[1]).toEqual({ mapId: MAP_ID, sessionId: SESSION_ID });
        call[2](new Error("timeout"));
        await expect(pending).resolves.toBeNull();

        const granted = latestControl.reacquire();
        fakeSocket.timedEmit.mock.calls[1][2](null, GRANTED);
        await expect(granted).resolves.toEqual(GRANTED);
    });
});
