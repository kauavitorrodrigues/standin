import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import {
    setDeviceEnabledPreference,
    setPreferredDeviceId,
} from "../../lib/mediaDevicePreferences";
import { useLocalAudioStream } from "../useLocalAudioStream";
import {
    createFakeAudioContext,
    createFakeMicStream,
} from "../../lib/__tests__/fakeAudioContext";

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

const flush = () => act(async () => void (await Promise.resolve()));

const CLIP = {
    playId: "p1",
    buffer: createFakeAudioContext().context.createBuffer(1, 1, 44100),
    volume: 1,
};

describe("useLocalAudioStream", () => {
    let fake: ReturnType<typeof createFakeAudioContext>;
    let mic: ReturnType<typeof createFakeMicStream>;
    const getUserMedia = vi.fn();

    beforeEach(() => {
        fake = createFakeAudioContext();
        mic = createFakeMicStream();
        getUserMedia.mockReset();
        getUserMedia.mockImplementation(() => Promise.resolve(mic.stream));
        vi.stubGlobal("localStorage", createMemoryStorage());
        vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
        vi.stubGlobal(
            "AudioContext",
            vi.fn(function () {
                return fake.raw;
            })
        );
    });

    afterEach(() => {
        unmountAllHooks();
        vi.unstubAllGlobals();
    });

    it("returns the mixed stream rather than the raw microphone", async () => {
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();

        expect(result.current.stream).toBe(fake.mediaDestination.stream);
        expect(result.current.stream).not.toBe(mic.stream);
        expect(result.current.error).toBeNull();
    });

    it("starts the microphone live and the track enabled", async () => {
        renderHook(() => useLocalAudioStream());
        await flush();

        expect(fake.gain.gain.value).toBe(1);
        expect(fake.publishedTrack.enabled).toBe(true);
    });

    it("mutes the microphone when the mute preference turns off", async () => {
        renderHook(() => useLocalAudioStream());
        await flush();

        act(() => setDeviceEnabledPreference("microphone", false));

        expect(fake.gain.gain.value).toBe(0);
        expect(fake.publishedTrack.enabled).toBe(true);
    });

    it("applies a mute chosen before the stream was ready", async () => {
        setDeviceEnabledPreference("microphone", false);
        renderHook(() => useLocalAudioStream());
        await flush();

        expect(fake.gain.gain.value).toBe(0);
    });

    it("gates the published track with the proximity gate", async () => {
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();

        act(() => result.current.setProximityGate(false));
        expect(fake.publishedTrack.enabled).toBe(false);

        act(() => result.current.setProximityGate(true));
        expect(fake.publishedTrack.enabled).toBe(true);
    });

    it("keeps a clip out of the mute but not out of the proximity gate", async () => {
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();

        act(() => setDeviceEnabledPreference("microphone", false));
        const started = result.current.playClip(CLIP);

        expect(started).toBe(true);
        expect(fake.sources.at(0)?.start).toHaveBeenCalled();
        expect(fake.publishedTrack.enabled).toBe(true);

        act(() => result.current.setProximityGate(false));
        expect(fake.publishedTrack.enabled).toBe(false);
    });

    it("lets plays overlap through the hook, and stops one or all of them", async () => {
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();

        result.current.playClip({ ...CLIP, playId: "p1" });
        result.current.playClip({ ...CLIP, playId: "p2" });
        result.current.playClip({ ...CLIP, playId: "p3" });
        expect(fake.sources).toHaveLength(3);

        result.current.stopClip("p2");
        expect(fake.sources.at(1)?.stop).toHaveBeenCalled();
        expect(fake.sources.at(0)?.stop).not.toHaveBeenCalled();

        result.current.stopAllClips();
        expect(fake.sources.at(0)?.stop).toHaveBeenCalled();
        expect(fake.sources.at(2)?.stop).toHaveBeenCalled();
    });

    it("stops every play when the microphone is switched", async () => {
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();
        result.current.playClip(CLIP);

        act(() => setPreferredDeviceId("microphone", "other-mic"));
        await flush();

        expect(fake.sources.at(0)?.stop).toHaveBeenCalled();
    });

    it("cannot play before there is a microphone", () => {
        const { result } = renderHook(() => useLocalAudioStream());

        expect(result.current.playClip(CLIP)).toBe(false);
    });

    it("reports the error and publishes nothing when the microphone is denied", async () => {
        getUserMedia.mockImplementation(() =>
            Promise.reject(new DOMException("denied", "NotAllowedError"))
        );
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();

        expect(result.current.stream).toBeNull();
        expect(result.current.error).not.toBeNull();
    });

    it("rebuilds the graph and releases the old one when the device changes", async () => {
        renderHook(() => useLocalAudioStream());
        await flush();
        const first = fake.raw.close;

        act(() => setPreferredDeviceId("microphone", "other-mic"));
        await flush();

        expect(getUserMedia).toHaveBeenCalledTimes(2);
        expect(first).toHaveBeenCalled();
        expect(mic.track.stop).toHaveBeenCalled();
    });

    it("creates the context with the sample rate of the microphone", async () => {
        renderHook(() => useLocalAudioStream());
        await flush();

        expect(AudioContext).toHaveBeenCalledWith({ sampleRate: 48000 });
    });

    it("falls back to the plain microphone when the context cannot be created", async () => {
        vi.stubGlobal(
            "AudioContext",
            vi.fn(function () {
                throw new DOMException("no audio", "NotSupportedError");
            })
        );
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();

        expect(result.current.stream).toBe(mic.stream);
        expect(result.current.error).toBeNull();
        expect(result.current.playClip(CLIP)).toBe(false);
    });

    it("keeps mute and the proximity gate working on the plain microphone", async () => {
        fake.raw.createMediaStreamSource.mockImplementation(() => {
            throw new DOMException("graph failed", "InvalidStateError");
        });
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const { result } = renderHook(() => useLocalAudioStream());
        await flush();

        expect(result.current.stream).toBe(mic.stream);
        expect(fake.raw.close).toHaveBeenCalled();

        act(() => setDeviceEnabledPreference("microphone", false));
        expect(mic.track.enabled).toBe(false);

        act(() => setDeviceEnabledPreference("microphone", true));
        act(() => result.current.setProximityGate(false));
        expect(mic.track.enabled).toBe(false);

        act(() => result.current.setProximityGate(true));
        expect(mic.track.enabled).toBe(true);
    });

    it("tries to resume a context that starts suspended", async () => {
        fake.raw.state = "suspended";
        renderHook(() => useLocalAudioStream());
        await flush();

        expect(fake.raw.resume).toHaveBeenCalled();
    });

    it("releases the graph and the microphone on unmount", async () => {
        const { unmount } = renderHook(() => useLocalAudioStream());
        await flush();

        unmount();

        expect(mic.track.stop).toHaveBeenCalled();
        expect(fake.raw.close).toHaveBeenCalled();
    });
});
