import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EDITOR_VIEW_PREFERENCES_STORAGE_KEY } from "@/features/editor/consts/editorViewPreferences";

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

// The preference caches its value per module, so each case loads a fresh one.
const loadCreateEditorStore = async () =>
    (await import("@/features/editor/lib/EditorStore"))
        .createEditorStore;

describe("EditorStore view preferences", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", createMemoryStorage());
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("starts with the grid and the zones on when nothing is stored", async () => {
        const createEditorStore = await loadCreateEditorStore();

        expect(createEditorStore().getState()).toMatchObject({
            gridVisible: true,
            zonesVisible: true,
        });
    });

    it("opens the way the previous editor was left", async () => {
        const first = (await loadCreateEditorStore())();
        first.toggleGrid();
        first.toggleZones();

        vi.resetModules();
        const second = (await loadCreateEditorStore())();

        expect(second.getState()).toMatchObject({
            gridVisible: false,
            zonesVisible: false,
        });
    });

    it("keeps a stored choice per field and ignores invalid ones", async () => {
        localStorage.setItem(
            EDITOR_VIEW_PREFERENCES_STORAGE_KEY,
            JSON.stringify({ gridVisible: false, zonesVisible: "no" })
        );
        const createEditorStore = await loadCreateEditorStore();

        expect(createEditorStore().getState()).toMatchObject({
            gridVisible: false,
            zonesVisible: true,
        });
    });

    it("falls back to the defaults when the stored value is corrupt", async () => {
        localStorage.setItem(EDITOR_VIEW_PREFERENCES_STORAGE_KEY, "{oops");
        const createEditorStore = await loadCreateEditorStore();

        expect(createEditorStore().getState()).toMatchObject({
            gridVisible: true,
            zonesVisible: true,
        });
    });
});
