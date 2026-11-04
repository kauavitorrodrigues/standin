// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SpaceRaisedHand } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const listeners = new Map<string, (payload?: unknown) => void>();
const { emitSetHandRaised, playHandRaiseSound, toastAdd } = vi.hoisted(() => ({
    emitSetHandRaised: vi.fn(),
    playHandRaiseSound: vi.fn(),
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
vi.mock("../../lib/emitSetHandRaised", () => ({
    emitSetHandRaised: (raised: boolean) => emitSetHandRaised(raised),
}));
vi.mock("../../lib/playHandRaiseSound", () => ({
    playHandRaiseSound: () => playHandRaiseSound(),
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: toastAdd } }));

import { useHandRaise } from "../useHandRaise";

const make = (socketId: string): SpaceRaisedHand => ({
    socketId,
    userId: `user-${socketId}`,
    raisedSince: 1,
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    listeners.clear();
    emitSetHandRaised.mockReset();
    playHandRaiseSound.mockReset();
    toastAdd.mockReset();
});
afterEach(unmountAllHooks);

describe("useHandRaise", () => {
    it("keeps the list as received and dings only for a new hand", () => {
        const { result, act } = renderHook(() => useHandRaise());
        const send = (hands: SpaceRaisedHand[]) =>
            act(() => listeners.get("space:raised-hands")?.({ hands }));

        send([make("b"), make("a")]);
        expect(result.current.hands.map((h) => h.socketId)).toEqual(["b", "a"]);
        expect(playHandRaiseSound).toHaveBeenCalledTimes(1);

        send([make("b"), make("a")]);
        send([make("a")]);
        expect(playHandRaiseSound).toHaveBeenCalledTimes(1);

        send([]);
        expect(result.current.hands).toEqual([]);
        expect(playHandRaiseSound).toHaveBeenCalledTimes(1);
    });

    it("raises the hand from the ack and lowers it again", async () => {
        emitSetHandRaised.mockResolvedValueOnce({ ok: true, raisedSince: 10 });
        const { result, act } = renderHook(() => useHandRaise());

        await act(async () => {
            result.current.raise();
            await flush();
        });
        expect(emitSetHandRaised).toHaveBeenLastCalledWith(true);
        expect(result.current.isRaised).toBe(true);

        emitSetHandRaised.mockResolvedValueOnce({
            ok: true,
            raisedSince: null,
        });
        await act(async () => {
            result.current.lower();
            await flush();
        });
        expect(emitSetHandRaised).toHaveBeenLastCalledWith(false);
        expect(result.current.isRaised).toBe(false);
    });

    it("shows an error and keeps the hand down when the server refuses", async () => {
        emitSetHandRaised.mockResolvedValueOnce({
            ok: false,
            code: "HAND_RAISE_NOT_ALLOWED",
        });
        const { result, act } = renderHook(() => useHandRaise());

        await act(async () => {
            result.current.raise();
            await flush();
        });

        expect(result.current.isRaised).toBe(false);
        expect(toastAdd).toHaveBeenCalledTimes(1);
    });

    it("forgets everything when the space is joined again", async () => {
        emitSetHandRaised.mockResolvedValueOnce({ ok: true, raisedSince: 10 });
        const { result, act } = renderHook(() => useHandRaise());
        await act(async () => {
            listeners.get("space:raised-hands")?.({ hands: [make("a")] });
            result.current.raise();
            await flush();
        });
        expect(result.current.isRaised).toBe(true);

        act(() => listeners.get("space:joined")?.());

        expect(result.current.isRaised).toBe(false);
        expect(result.current.hands).toEqual([]);
    });
});
