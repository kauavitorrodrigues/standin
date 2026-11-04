// @vitest-environment jsdom
import { useSyncExternalStore } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SpaceAnnouncer } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const listeners = new Map<string, (payload?: unknown) => void>();
const {
    emitSetAnnouncing,
    emitShareVideoWithAnnouncer,
    playNotificationSound,
    toastAdd,
} = vi.hoisted(() => ({
    emitSetAnnouncing: vi.fn(),
    emitShareVideoWithAnnouncer: vi.fn(),
    playNotificationSound: vi.fn(),
    toastAdd: vi.fn(),
}));

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
    socket: { on: vi.fn(), off: vi.fn() },
}));
vi.mock("../../lib/emitSetAnnouncing", () => ({
    emitSetAnnouncing: (announcing: boolean) => emitSetAnnouncing(announcing),
}));
vi.mock("../../lib/emitShareVideoWithAnnouncer", () => ({
    emitShareVideoWithAnnouncer: (sharing: boolean) =>
        emitShareVideoWithAnnouncer(sharing),
}));
vi.mock("@/features/notifications/lib/playNotificationSound", () => ({
    playNotificationSound: () => playNotificationSound(),
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: toastAdd } }));

import { useAnnouncing } from "../useAnnouncing";

const make = (socketId: string): SpaceAnnouncer => ({
    socketId,
    userId: `user-${socketId}`,
    announcingSince: 1,
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// A stand-in for the live microphone toggle, so a test can mute while mounted.
let micEnabled = true;
const micSubscribers = new Set<() => void>();
const useTestMic = () =>
    useSyncExternalStore(
        (onChange) => {
            micSubscribers.add(onChange);
            return () => micSubscribers.delete(onChange);
        },
        () => micEnabled
    );

let cameraEnabled = true;
const cameraSubscribers = new Set<() => void>();
const useTestCamera = () =>
    useSyncExternalStore(
        (onChange) => {
            cameraSubscribers.add(onChange);
            return () => cameraSubscribers.delete(onChange);
        },
        () => cameraEnabled
    );

const mount = (initialMic: boolean) => {
    micEnabled = initialMic;
    cameraEnabled = true;
    const view = renderHook(() =>
        useAnnouncing({
            isMicEnabled: useTestMic(),
            isCameraEnabled: useTestCamera(),
        })
    );
    const setCamera = (value: boolean) =>
        view.act(() => {
            cameraEnabled = value;
            cameraSubscribers.forEach((notify) => notify());
        });
    const setMic = (value: boolean) =>
        view.act(() => {
            micEnabled = value;
            micSubscribers.forEach((notify) => notify());
        });
    return { ...view, setMic, setCamera };
};

beforeEach(() => {
    listeners.clear();
    emitSetAnnouncing.mockReset();
    emitShareVideoWithAnnouncer.mockReset();
    playNotificationSound.mockReset();
    toastAdd.mockReset();
});
afterEach(unmountAllHooks);

describe("useAnnouncing", () => {
    it("keeps the list as received and dings only for a new socket", () => {
        const { result, act } = mount(true);
        const send = (announcers: SpaceAnnouncer[]) =>
            act(() => listeners.get("space:announcers")?.({ announcers }));

        send([make("b"), make("a")]);
        expect(result.current.announcers.map((a) => a.socketId)).toEqual([
            "b",
            "a",
        ]);
        expect(playNotificationSound).toHaveBeenCalledTimes(1);

        send([make("b"), make("a")]);
        send([make("a")]);
        expect(playNotificationSound).toHaveBeenCalledTimes(1);

        send([]);
        expect(result.current.announcers).toEqual([]);
        expect(playNotificationSound).toHaveBeenCalledTimes(1);
    });

    it("starts announcing from the ack and stops again", async () => {
        emitSetAnnouncing.mockResolvedValueOnce({
            ok: true,
            announcingSince: 10,
        });
        const { result, act } = mount(true);

        await act(async () => {
            result.current.start();
            await flush();
        });
        expect(emitSetAnnouncing).toHaveBeenLastCalledWith(true);
        expect(result.current.isAnnouncing).toBe(true);

        emitSetAnnouncing.mockResolvedValueOnce({
            ok: true,
            announcingSince: null,
        });
        await act(async () => {
            result.current.stop();
            await flush();
        });
        expect(emitSetAnnouncing).toHaveBeenLastCalledWith(false);
        expect(result.current.isAnnouncing).toBe(false);
    });

    it("does not start while the microphone is muted", async () => {
        const { result, act } = mount(false);

        expect(result.current.disabledReason).toBe("mic-muted");
        await act(async () => {
            result.current.start();
            await flush();
        });

        expect(emitSetAnnouncing).not.toHaveBeenCalled();
        expect(result.current.isAnnouncing).toBe(false);
    });

    it("shows an error and stays quiet when the server refuses", async () => {
        emitSetAnnouncing.mockResolvedValueOnce({
            ok: false,
            code: "ANNOUNCING_NOT_ALLOWED",
        });
        const { result, act } = mount(true);

        await act(async () => {
            result.current.start();
            await flush();
        });

        expect(result.current.isAnnouncing).toBe(false);
        expect(toastAdd).toHaveBeenCalledTimes(1);
    });

    it("forgets everything when the space is joined again", async () => {
        emitSetAnnouncing.mockResolvedValueOnce({
            ok: true,
            announcingSince: 10,
        });
        const { result, act } = mount(true);
        await act(async () => {
            listeners.get("space:announcers")?.({ announcers: [make("a")] });
            result.current.start();
            await flush();
        });
        expect(result.current.isAnnouncing).toBe(true);

        act(() => listeners.get("space:joined")?.());

        expect(result.current.isAnnouncing).toBe(false);
        expect(result.current.announcers).toEqual([]);
    });

    it("stops announcing when the microphone is muted", async () => {
        emitSetAnnouncing.mockResolvedValueOnce({
            ok: true,
            announcingSince: 10,
        });
        const { result, act, setMic } = mount(true);
        await act(async () => {
            result.current.start();
            await flush();
        });
        expect(result.current.isAnnouncing).toBe(true);

        emitSetAnnouncing.mockResolvedValueOnce({
            ok: true,
            announcingSince: null,
        });
        await act(async () => {
            setMic(false);
            await flush();
        });

        expect(emitSetAnnouncing).toHaveBeenLastCalledWith(false);
        expect(result.current.isAnnouncing).toBe(false);
    });

    it("shares the camera from the ack and ends it when the list empties", async () => {
        emitShareVideoWithAnnouncer.mockResolvedValueOnce({
            ok: true,
            sharingSince: 20,
        });
        const { result, act } = mount(true);

        await act(async () => {
            result.current.toggleVideoSharing();
            await flush();
        });
        expect(emitShareVideoWithAnnouncer).toHaveBeenLastCalledWith(true);
        expect(result.current.isSharingVideo).toBe(true);

        act(() => listeners.get("space:announcers")?.({ announcers: [] }));
        expect(result.current.isSharingVideo).toBe(false);
    });

    it("asks to stop sharing when it is on, and warns when it fails", async () => {
        emitShareVideoWithAnnouncer.mockResolvedValueOnce({
            ok: true,
            sharingSince: 20,
        });
        const { result, act } = mount(true);
        await act(async () => {
            result.current.toggleVideoSharing();
            await flush();
        });

        emitShareVideoWithAnnouncer.mockResolvedValueOnce({
            ok: false,
            code: "SHARE_VIDEO_INVALID",
        });
        await act(async () => {
            result.current.toggleVideoSharing();
            await flush();
        });

        expect(emitShareVideoWithAnnouncer).toHaveBeenLastCalledWith(false);
        expect(result.current.isSharingVideo).toBe(true);
        expect(toastAdd).toHaveBeenCalledTimes(1);
    });

    it("offers the sharing only while the camera is on and ends it when it goes off", async () => {
        emitShareVideoWithAnnouncer.mockResolvedValue({
            ok: true,
            sharingSince: 20,
        });
        const { result, act, setCamera } = mount(true);
        expect(result.current.canShareVideo).toBe(true);

        await act(async () => {
            result.current.toggleVideoSharing();
            await flush();
        });
        expect(result.current.isSharingVideo).toBe(true);

        emitShareVideoWithAnnouncer.mockResolvedValue({
            ok: true,
            sharingSince: null,
        });
        await act(async () => {
            setCamera(false);
            await flush();
        });

        expect(emitShareVideoWithAnnouncer).toHaveBeenLastCalledWith(false);
        expect(result.current.canShareVideo).toBe(false);
        expect(result.current.isSharingVideo).toBe(false);
    });
});
