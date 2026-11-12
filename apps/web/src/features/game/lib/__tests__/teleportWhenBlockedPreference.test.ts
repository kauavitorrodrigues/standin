import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TELEPORT_WHEN_BLOCKED_STORAGE_KEY } from "@/features/game/consts/teleport-preference";

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
        await import("@/features/game/lib/teleportWhenBlockedPreference");
    return module.teleportWhenBlockedPreference;
};

describe("teleportWhenBlockedPreference", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("is on by default", async () => {
        const preference = await loadPreference();

        expect(preference.get()).toBe(true);
    });

    it("reads a stored value", async () => {
        localStorage.setItem(TELEPORT_WHEN_BLOCKED_STORAGE_KEY, "false");

        const preference = await loadPreference();

        expect(preference.get()).toBe(false);
    });

    it("falls back to on for a value that is not a boolean", async () => {
        localStorage.setItem(TELEPORT_WHEN_BLOCKED_STORAGE_KEY, '"no"');

        const preference = await loadPreference();

        expect(preference.get()).toBe(true);
    });

    it("keeps what was set", async () => {
        const preference = await loadPreference();

        preference.set(false);

        expect(preference.get()).toBe(false);
        expect(localStorage.getItem(TELEPORT_WHEN_BLOCKED_STORAGE_KEY)).toBe(
            "false"
        );
    });
});
