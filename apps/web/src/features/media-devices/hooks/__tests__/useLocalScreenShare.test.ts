import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useLocalScreenShare } from "../useLocalScreenShare";

type FakeTrack = {
    stop: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    contentHint: string;
};

const createFakeStream = () => {
    const track: FakeTrack = {
        stop: vi.fn(),
        addEventListener: vi.fn(),
        contentHint: "",
    };
    const stream = {
        getVideoTracks: () => [track],
        getTracks: () => [track],
    } as unknown as MediaStream;
    return { stream, track };
};

// getDisplayMedia that stays pending until the test answers the "picker".
const createPicker = () => {
    let resolve!: (stream: MediaStream) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<MediaStream>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    const getDisplayMedia = vi.fn(() => promise);
    return { getDisplayMedia, resolve, reject };
};

describe("useLocalScreenShare", () => {
    beforeEach(() => {
        vi.stubGlobal("navigator", { mediaDevices: {} });
    });

    afterEach(() => {
        unmountAllHooks();
        vi.unstubAllGlobals();
    });

    it("shares once the person picks something", async () => {
        const picker = createPicker();
        navigator.mediaDevices.getDisplayMedia = picker.getDisplayMedia;
        const { result, act } = renderHook(useLocalScreenShare);
        const { stream } = createFakeStream();

        await act(async () => {
            const pending = result.current.start();
            picker.resolve(stream);
            await pending;
        });

        expect(result.current.isSharing).toBe(true);
    });

    it("does not open a second picker while one is pending", async () => {
        const picker = createPicker();
        navigator.mediaDevices.getDisplayMedia = picker.getDisplayMedia;
        const { result, act } = renderHook(useLocalScreenShare);

        await act(async () => {
            void result.current.start();
            void result.current.start();
        });

        expect(picker.getDisplayMedia).toHaveBeenCalledTimes(1);
    });

    it("stops a capture that arrives after the page is gone", async () => {
        const picker = createPicker();
        navigator.mediaDevices.getDisplayMedia = picker.getDisplayMedia;
        const { result, unmount, act } = renderHook(useLocalScreenShare);
        const { stream, track } = createFakeStream();

        await act(async () => {
            void result.current.start();
        });
        unmount();
        await act(async () => {
            picker.resolve(stream);
        });

        expect(track.stop).toHaveBeenCalled();
    });

    it("stops the tracks on unmount while sharing", async () => {
        const picker = createPicker();
        navigator.mediaDevices.getDisplayMedia = picker.getDisplayMedia;
        const { result, unmount, act } = renderHook(useLocalScreenShare);
        const { stream, track } = createFakeStream();

        await act(async () => {
            const pending = result.current.start();
            picker.resolve(stream);
            await pending;
        });
        unmount();

        expect(track.stop).toHaveBeenCalled();
    });

    it("clears an old error when the person tries again", async () => {
        const first = createPicker();
        navigator.mediaDevices.getDisplayMedia = first.getDisplayMedia;
        const { result, act } = renderHook(useLocalScreenShare);

        await act(async () => {
            const pending = result.current.start();
            first.reject(new Error("denied"));
            await pending;
        });
        expect(result.current.error).not.toBeNull();

        const second = createPicker();
        navigator.mediaDevices.getDisplayMedia = second.getDisplayMedia;
        await act(async () => {
            void result.current.start();
        });

        expect(result.current.error).toBeNull();
    });
});
