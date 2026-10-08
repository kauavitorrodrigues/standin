import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { setDeviceEnabledPreference } from "../../lib/mediaDevicePreferences";
import { useLocalCameraStream } from "../useLocalCameraStream";

const createMemoryStorage = (): Storage => {
    const data = new Map<string, string>();
    return {
        get length() {
            return data.size;
        },
        clear: () => data.clear(),
        getItem: (key) => data.get(key) ?? null,
        key: (index) => [...data.keys()][index] ?? null,
        removeItem: (key) => void data.delete(key),
        setItem: (key, value) => void data.set(key, String(value)),
    };
};

const createFakeStream = () => {
    const listeners = new Map<string, () => void>();
    const track = {
        stop: vi.fn(),
        addEventListener: vi.fn((type: string, listener: () => void) => {
            listeners.set(type, listener);
        }),
    };
    const stream = {
        getVideoTracks: () => [track],
        getTracks: () => [track],
    } as unknown as MediaStream;
    return { stream, track, fire: (type: string) => listeners.get(type)?.() };
};

const createAcquisition = () => {
    let resolve!: (stream: MediaStream) => void;
    const promise = new Promise<MediaStream>((res) => {
        resolve = res;
    });
    return { getUserMedia: vi.fn(() => promise), resolve };
};

describe("useLocalCameraStream", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
        vi.stubGlobal("navigator", { mediaDevices: {} });
    });

    afterEach(() => {
        unmountAllHooks();
        setDeviceEnabledPreference("camera", false);
        vi.unstubAllGlobals();
    });

    it("stays closed while the camera is off", () => {
        const acquisition = createAcquisition();
        navigator.mediaDevices.getUserMedia = acquisition.getUserMedia;

        const { result } = renderHook(useLocalCameraStream);

        expect(result.current.stream).toBeNull();
        expect(acquisition.getUserMedia).not.toHaveBeenCalled();
    });

    it("opens the camera when it is on and releases it on unmount", async () => {
        setDeviceEnabledPreference("camera", true);
        const acquisition = createAcquisition();
        navigator.mediaDevices.getUserMedia = acquisition.getUserMedia;
        const { result, unmount, act } = renderHook(useLocalCameraStream);
        const { stream, track } = createFakeStream();

        await act(async () => acquisition.resolve(stream));
        expect(result.current.stream).toBe(stream);

        unmount();
        expect(track.stop).toHaveBeenCalled();
    });

    it("stops a stream that arrives after unmount", async () => {
        setDeviceEnabledPreference("camera", true);
        const acquisition = createAcquisition();
        navigator.mediaDevices.getUserMedia = acquisition.getUserMedia;
        const { unmount, act } = renderHook(useLocalCameraStream);
        const { stream, track } = createFakeStream();

        unmount();
        await act(async () => acquisition.resolve(stream));

        expect(track.stop).toHaveBeenCalled();
    });

    it("drops the stream and reports an error when the track ends by itself", async () => {
        setDeviceEnabledPreference("camera", true);
        const acquisition = createAcquisition();
        navigator.mediaDevices.getUserMedia = acquisition.getUserMedia;
        const { result, act } = renderHook(useLocalCameraStream);
        const { stream, fire } = createFakeStream();

        await act(async () => acquisition.resolve(stream));
        act(() => fire("ended"));

        expect(result.current.stream).toBeNull();
        expect(result.current.error).toBe("unknown");
    });
});
