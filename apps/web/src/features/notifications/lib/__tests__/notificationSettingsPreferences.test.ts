import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOTIFICATION_SETTINGS_STORAGE_KEY } from "@/features/notifications/consts/notificationSettings";

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

const loadPreference = async () => {
    vi.resetModules();
    const module =
        await import("@/features/notifications/lib/notificationSettingsPreferences");
    return module.notificationSettingsPreference;
};

describe("notificationSettingsPreference", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("ignores the retired nearbyNotify key and keeps the other settings", async () => {
        localStorage.setItem(
            NOTIFICATION_SETTINGS_STORAGE_KEY,
            JSON.stringify({
                chatNotify: "all",
                chatSound: "never",
                nearbyNotify: "none",
            })
        );

        const preference = await loadPreference();

        expect(preference.get()).toEqual({
            chatNotify: "all",
            chatSound: "never",
        });
    });
});
