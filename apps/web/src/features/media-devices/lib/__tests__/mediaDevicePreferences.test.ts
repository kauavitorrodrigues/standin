import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    getDeviceEnabledPreference,
    setDeviceEnabledPreference,
    subscribeToDeviceEnabledPreference,
} from "../mediaDevicePreferences";

// The test environment does not reliably provide a working localStorage, so
// the preferences module is exercised against a small in-memory one.
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

describe("device enabled preferences", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("the microphone defaults to on", () => {
        expect(getDeviceEnabledPreference("microphone")).toBe(true);
    });

    it("the camera defaults to off", () => {
        expect(getDeviceEnabledPreference("camera")).toBe(false);
    });

    it("a stored choice overrides the default", () => {
        setDeviceEnabledPreference("camera", true);
        setDeviceEnabledPreference("microphone", false);

        expect(getDeviceEnabledPreference("camera")).toBe(true);
        expect(getDeviceEnabledPreference("microphone")).toBe(false);
    });

    it("never writes the camera choice to storage", () => {
        setDeviceEnabledPreference("camera", true);
        setDeviceEnabledPreference("microphone", true);

        expect(localStorage.getItem("media_camera_enabled")).toBeNull();
        expect(localStorage.getItem("media_microphone_enabled")).toBe("true");
    });

    it("ignores a camera choice left in storage by an older version", async () => {
        // The session choice lives in module state, so this test needs a
        // fresh copy of the module to see what a new page load would.
        vi.resetModules();
        localStorage.setItem("media_camera_enabled", "true");
        const fresh = await import("../mediaDevicePreferences");

        expect(fresh.getDeviceEnabledPreference("camera")).toBe(false);
    });

    it("notifies subscribers of the same kind only, until they unsubscribe", () => {
        const camera = vi.fn();
        const microphone = vi.fn();
        const unsubscribe = subscribeToDeviceEnabledPreference("camera", camera);
        subscribeToDeviceEnabledPreference("microphone", microphone);

        setDeviceEnabledPreference("camera", true);
        unsubscribe();
        setDeviceEnabledPreference("camera", false);

        expect(camera).toHaveBeenCalledTimes(1);
        expect(camera).toHaveBeenCalledWith(true);
        expect(microphone).not.toHaveBeenCalled();
    });
});
