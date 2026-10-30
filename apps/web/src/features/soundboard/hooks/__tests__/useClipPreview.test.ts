import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import type { LocalPlayback } from "../../types/playback";

const mocks = vi.hoisted(() => ({
    stopLocal: vi.fn(),
    playLocalBuffer: vi.fn(),
}));

vi.mock("../../lib/clipBufferCache", () => ({
    getClipBuffer: () => Promise.resolve({}),
}));
vi.mock("../../lib/playLocalBuffer", () => ({
    playLocalBuffer: mocks.playLocalBuffer,
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: vi.fn() } }));

import { useClipPreview } from "../useClipPreview";

const CLIP_A = { id: "a", fileUrl: "/files/a", volume: 0.5 };
const CLIP_B = { id: "b", fileUrl: "/files/b", volume: 1 };

describe("useClipPreview", () => {
    beforeEach(() => {
        mocks.stopLocal.mockReset();
        mocks.playLocalBuffer.mockReset();
        mocks.playLocalBuffer.mockImplementation(() => mocks.stopLocal);
        vi.stubGlobal(
            "AudioContext",
            vi.fn(function () {
                return { close: () => Promise.resolve() };
            })
        );
    });

    afterEach(() => {
        unmountAllHooks();
        vi.unstubAllGlobals();
    });

    it("is never disabled, since it needs no microphone", () => {
        const { result } = renderHook(useClipPreview);

        expect(result.current.disabledReason).toBeNull();
        expect(result.current.playingClipIds.size).toBe(0);
    });

    it("plays the clip at its volume and says which one plays", async () => {
        const { result } = renderHook(useClipPreview);

        await act(() => result.current.play(CLIP_A));

        const start: LocalPlayback | undefined =
            mocks.playLocalBuffer.mock.calls.at(0)?.at(1);
        expect(start?.volume).toBe(0.5);
        expect([...result.current.playingClipIds]).toEqual(["a"]);
    });

    it("stops the clip that plays when another starts", async () => {
        const { result } = renderHook(useClipPreview);
        await act(() => result.current.play(CLIP_A));

        await act(() => result.current.play(CLIP_B));

        expect(mocks.stopLocal).toHaveBeenCalledTimes(1);
        expect([...result.current.playingClipIds]).toEqual(["b"]);
    });

    it("clears the playing clip when it ends by itself", async () => {
        const { result } = renderHook(useClipPreview);
        await act(() => result.current.play(CLIP_A));
        const start: LocalPlayback | undefined =
            mocks.playLocalBuffer.mock.calls.at(0)?.at(1);

        act(() => start?.onEnded?.());

        expect(result.current.playingClipIds.size).toBe(0);
    });

    it("stops on demand, which the call cannot", async () => {
        const { result } = renderHook(useClipPreview);
        await act(() => result.current.play(CLIP_A));

        act(() => result.current.stop());

        expect(mocks.stopLocal).toHaveBeenCalledTimes(1);
        expect(result.current.playingClipIds.size).toBe(0);
    });

    it("does nothing when it is stopped with nothing playing", () => {
        const { result } = renderHook(useClipPreview);

        act(() => result.current.stop());

        expect(mocks.stopLocal).not.toHaveBeenCalled();
    });

    it("stops what plays when it unmounts", async () => {
        const { result, unmount } = renderHook(useClipPreview);
        await act(() => result.current.play(CLIP_A));

        unmount();

        expect(mocks.stopLocal).toHaveBeenCalled();
    });
});
