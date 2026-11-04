import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    readChecklistPreferences,
    writeChecklistPreferences,
} from "../checklistPreferences";

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

describe("checklistPreferences", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("starts with nothing done", () => {
        expect(readChecklistPreferences("u1")).toEqual({
            autoOpened: false,
            celebrated: false,
        });
    });

    it("keeps a change and the other value", () => {
        writeChecklistPreferences("u1", { autoOpened: true });
        writeChecklistPreferences("u1", { celebrated: true });
        expect(readChecklistPreferences("u1")).toEqual({
            autoOpened: true,
            celebrated: true,
        });
    });

    it("keeps one record per person", () => {
        writeChecklistPreferences("u1", { autoOpened: true });
        expect(readChecklistPreferences("u2").autoOpened).toBe(false);
    });

    it("falls back to the default when the stored value is broken", () => {
        localStorage.setItem("onboarding_checklist_u1", "{nope");
        expect(readChecklistPreferences("u1").autoOpened).toBe(false);
    });
});
