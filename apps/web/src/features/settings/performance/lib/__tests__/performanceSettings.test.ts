import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PERFORMANCE_SETTINGS } from "../../consts/performanceSettings";
import { getFpsLimit, getMaxVideoPeers } from "../performanceValues";

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

describe("performance values", () => {
    it("keeps today's behavior by default", () => {
        expect(getFpsLimit(DEFAULT_PERFORMANCE_SETTINGS)).toBe(0);
        expect(getMaxVideoPeers(DEFAULT_PERFORMANCE_SETTINGS)).toBe(4);
        expect(DEFAULT_PERFORMANCE_SETTINGS.reduceMotion).toBe(false);
    });

    it("turns the chosen ids into numbers", () => {
        const settings = {
            ...DEFAULT_PERFORMANCE_SETTINGS,
            fpsLimit: "30",
            maxVideoPeers: "2",
        } as const;

        expect(getFpsLimit(settings)).toBe(30);
        expect(getMaxVideoPeers(settings)).toBe(2);
    });
});

describe("performance settings preference", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("falls back per field when the stored value is not allowed", async () => {
        localStorage.setItem(
            "performance_settings",
            JSON.stringify({ fpsLimit: "144", maxVideoPeers: "2", reduceMotion: "yes" })
        );
        const { performanceSettingsPreference } = await import(
            "../performanceSettingsPreferences"
        );

        expect(performanceSettingsPreference.get()).toEqual({
            fpsLimit: "auto",
            maxVideoPeers: "2",
            reduceMotion: false,
        });
    });
});
