import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SOUND_EFFECT_STATE } from "@/features/sounds/consts/soundEffect";

type FakeAudio = {
    loop: boolean;
    volume: number;
    currentTime: number;
    src: string;
    srcObject: unknown;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    removeAttribute: ReturnType<typeof vi.fn>;
    setSinkId: ReturnType<typeof vi.fn>;
};

let audios: FakeAudio[] = [];
let speaker: string | null = null;
let speakerListeners: Array<(id: string) => void> = [];

const loadModule = async () => {
    vi.resetModules();
    vi.doMock("@/features/media-devices/lib/mediaDevicePreferences", () => ({
        getPreferredDeviceId: () => speaker,
        subscribeToPreferredDeviceId: (
            _kind: string,
            listener: (id: string) => void
        ) => {
            speakerListeners.push(listener);
            return () => {
                speakerListeners = speakerListeners.filter(
                    (item) => item !== listener
                );
            };
        },
    }));
    return (await import("@/features/sounds/lib/SoundEffect")).SoundEffect;
};

describe("SoundEffect", () => {
    beforeEach(() => {
        audios = [];
        speaker = null;
        speakerListeners = [];
        vi.stubGlobal(
            "Audio",
            class {
                constructor() {
                    const audio: FakeAudio = {
                        loop: false,
                        volume: 1,
                        currentTime: 5,
                        src: "",
                        srcObject: null,
                        play: vi.fn().mockResolvedValue(undefined),
                        pause: vi.fn(),
                        removeAttribute: vi.fn(),
                        setSinkId: vi.fn().mockResolvedValue(undefined),
                    };
                    audios.push(audio);
                    return audio;
                }
            }
        );
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                blob: () => Promise.resolve(new Blob(["x"])),
            })
        );
        URL.createObjectURL = vi.fn(() => "blob:sound");
        URL.revokeObjectURL = vi.fn();
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("loads the file as a blob and plays it from the start", async () => {
        const SoundEffect = await loadModule();
        const effect = new SoundEffect("/ding.wav", false, 0.4);

        expect(await effect.play()).toBe(true);
        expect(audios[0].src).toBe("blob:sound");
        expect(audios[0].currentTime).toBe(0);
        expect(audios[0].volume).toBe(0.4);
        expect(effect.state).toBe(SOUND_EFFECT_STATE.PLAYING);
    });

    it("returns false without throwing when the browser refuses to play", async () => {
        const SoundEffect = await loadModule();
        const effect = new SoundEffect("/ding.wav");
        audios[0].play.mockRejectedValue(new Error("NotAllowedError"));

        await expect(effect.play()).resolves.toBe(false);
        expect(effect.state).toBe(SOUND_EFFECT_STATE.ERRORED);
        expect(audios[0].play).toHaveBeenCalledTimes(1);
    });

    it("returns false and does not retry when the file fails to load", async () => {
        const SoundEffect = await loadModule();
        vi.mocked(fetch).mockRejectedValue(new Error("offline"));
        const effect = new SoundEffect("/ding.wav");

        await expect(effect.play()).resolves.toBe(false);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(audios[0].play).not.toHaveBeenCalled();
    });

    it("ignores a play while another one is starting", async () => {
        const SoundEffect = await loadModule();
        const effect = new SoundEffect("/ding.wav");

        const first = effect.play();
        const second = await effect.play();
        expect(second).toBe(false);
        expect(await first).toBe(true);
        expect(audios[0].play).toHaveBeenCalledTimes(1);
    });

    it("sends every effect to the speaker the person picks, live", async () => {
        speaker = "speaker-1";
        const SoundEffect = await loadModule();
        new SoundEffect("/a.wav");
        new SoundEffect("/b.wav");
        expect(audios[0].setSinkId).toHaveBeenCalledWith("speaker-1");

        speakerListeners.forEach((listener) => listener("speaker-2"));
        expect(audios[0].setSinkId).toHaveBeenLastCalledWith("speaker-2");
        expect(audios[1].setSinkId).toHaveBeenLastCalledWith("speaker-2");
    });

    it("stops following the speaker once destroyed", async () => {
        const SoundEffect = await loadModule();
        const effect = new SoundEffect("/a.wav");
        effect.destroy();

        expect(speakerListeners).toHaveLength(0);
        expect(effect.state).toBe(SOUND_EFFECT_STATE.DESTROYED);
        await expect(effect.play()).resolves.toBe(false);
    });

    it("keeps the volume between 0 and 1", async () => {
        const SoundEffect = await loadModule();
        const effect = new SoundEffect("/a.wav");
        effect.setVolume(3);
        expect(audios[0].volume).toBe(1);
        effect.setVolume(-1);
        expect(audios[0].volume).toBe(0);
    });
});
