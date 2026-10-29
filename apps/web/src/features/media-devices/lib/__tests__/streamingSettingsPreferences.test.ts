import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Like the audio preferences, these run against a small in-memory storage and
// load a fresh copy of the module, which caches what it reads.
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
    return import("../streamingSettingsPreferences");
};

const KEY = "media_screen_share_settings";

describe("screen share settings preference", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("does not share the sound until the person asks", async () => {
        const { screenShareSettingsPreference } = await loadPreferences();
        expect(screenShareSettingsPreference.get().shareAudio).toBe(false);
    });

    it("keeps the choice across page loads", async () => {
        const first = await loadPreferences();
        first.screenShareSettingsPreference.set({
            ...first.screenShareSettingsPreference.get(),
            shareAudio: true,
        });

        const second = await loadPreferences();
        expect(second.screenShareSettingsPreference.get().shareAudio).toBe(true);
    });

    it("reads the settings saved before the sound existed as off", async () => {
        localStorage.setItem(
            KEY,
            JSON.stringify({ resolution: "720p", frameRate: "15" })
        );
        const { screenShareSettingsPreference } = await loadPreferences();

        expect(screenShareSettingsPreference.get()).toMatchObject({
            resolution: "720p",
            frameRate: "15",
            shareAudio: false,
        });
    });

    it("ignores a value that is not a boolean", async () => {
        localStorage.setItem(KEY, JSON.stringify({ shareAudio: "yes" }));
        const { screenShareSettingsPreference } = await loadPreferences();
        expect(screenShareSettingsPreference.get().shareAudio).toBe(false);
    });
});
