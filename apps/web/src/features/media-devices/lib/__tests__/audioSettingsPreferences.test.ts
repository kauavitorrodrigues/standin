import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The test environment does not reliably provide a working localStorage, so
// the preferences are exercised against a small in-memory one. The module
// caches what it reads, so each test loads a fresh copy.
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

const loadPreferences = async () => {
    vi.resetModules();
    return import("../audioSettingsPreferences");
};

describe("audio settings preferences", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("starts with every processing switch on and the volume at full", async () => {
        const { audioProcessingPreference, outputVolumePreference } =
            await loadPreferences();

        expect(audioProcessingPreference.get()).toEqual({
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
        });
        expect(outputVolumePreference.get()).toBe(1);
    });

    it("keeps a changed switch across page loads", async () => {
        const first = await loadPreferences();
        first.audioProcessingPreference.set({
            noiseSuppression: false,
            echoCancellation: true,
            autoGainControl: true,
        });

        const second = await loadPreferences();
        expect(second.audioProcessingPreference.get().noiseSuppression).toBe(
            false
        );
    });

    it("falls back to the defaults when the stored value is garbage", async () => {
        localStorage.setItem("media_audio_processing", "not json");
        localStorage.setItem("media_output_volume", "7");
        const { audioProcessingPreference, outputVolumePreference } =
            await loadPreferences();

        expect(audioProcessingPreference.get().noiseSuppression).toBe(true);
        expect(outputVolumePreference.get()).toBe(1);
    });

    it("notifies subscribers and hands out a new snapshot on change", async () => {
        const { outputVolumePreference } = await loadPreferences();
        const listener = vi.fn();
        outputVolumePreference.subscribe(listener);

        outputVolumePreference.set(0.4);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(outputVolumePreference.get()).toBe(0.4);
    });
});
