// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LibraryPaletteArea, Stamp } from "@standin/contracts";
import { AreasTab } from "@/features/editor/components/instances/AreasTab";
import { AREA_PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { EditorStoreContext } from "@/features/editor/contexts/EditorStoreContext";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import type { EditorPalette } from "@/features/editor/types/editor-palette";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const area = (id: string, name: string): LibraryPaletteArea => ({
    id,
    name,
    width: 12,
    height: 8,
    objectCount: 3,
    thumbnailUrl: `/files/${id}`,
    version: 7,
});

const stamp = { version: 1, width: 12, height: 8 } as unknown as Stamp;

const flush = () => act(async () => {});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

const mount = (palette: Partial<EditorPalette>) => {
    const store = createEditorStore();
    const fetchAreaStamp = vi.fn(async (areaId: string) => ({
        id: areaId,
        name: "Sala",
        stamp,
        version: 7,
    }));
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const full: EditorPalette = {
        tilesets: [],
        categories: [],
        areas: [],
        fetchAreaStamp,
        isLoading: false,
        isError: false,
        ...palette,
    };
    act(() => {
        root.render(
            <QueryClientProvider client={queryClient}>
                <EditorStoreContext.Provider value={store}>
                    <AreasTab palette={full} />
                </EditorStoreContext.Provider>
            </QueryClientProvider>
        );
    });
    return { store, fetchAreaStamp: full.fetchAreaStamp };
};

const cards = () => [...container.querySelectorAll("button")];

describe("AreasTab", () => {
    it("shows the empty state when the library has no area", () => {
        mount({ areas: [] });

        expect(container.textContent).toContain("Nenhuma área disponível");
        expect(cards()).toHaveLength(0);
    });

    it("lists a card with the name and the size of each area", () => {
        mount({ areas: [area("a1", "Sala de reunião"), area("a2", "Mesa")] });

        expect(cards()).toHaveLength(2);
        expect(container.textContent).toContain("Sala de reunião");
        expect(container.textContent).toContain("12 x 8");
    });

    it("filters by name ignoring case and accents", () => {
        mount({ areas: [area("a1", "Sala de reunião"), area("a2", "Mesa")] });
        const input = container.querySelector("input") as HTMLInputElement;

        act(() => {
            const setValue = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value"
            )?.set;
            setValue?.call(input, "REUNIAO");
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });

        expect(cards()).toHaveLength(1);
        expect(container.textContent).toContain("Sala de reunião");
    });

    it("says nothing matched when the search finds no area", () => {
        mount({ areas: [area("a1", "Sala")] });
        const input = container.querySelector("input") as HTMLInputElement;

        act(() => {
            const setValue = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value"
            )?.set;
            setValue?.call(input, "zzz");
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });

        expect(container.textContent).toContain("Nenhuma área encontrada");
    });

    it("fetches the stamp of the version and enters the placing mode", async () => {
        const { store, fetchAreaStamp } = mount({
            areas: [area("a1", "Sala")],
        });

        act(() => cards()[0]?.click());
        await flush();

        expect(fetchAreaStamp).toHaveBeenCalledWith("a1", 7);
        expect(store.getState().placingArea?.area.id).toBe("a1");
        expect(store.getState().placingArea?.stamp).toBe(stamp);
    });

    it("reads the stamp from the cache on the second pick", async () => {
        const { store, fetchAreaStamp } = mount({
            areas: [area("a1", "Sala")],
        });

        act(() => cards()[0]?.click());
        await flush();
        act(() => cards()[0]?.click());
        await flush();
        expect(store.getState().placingArea).toBeNull();

        act(() => cards()[0]?.click());
        await flush();
        expect(store.getState().placingArea?.area.id).toBe("a1");
        expect(fetchAreaStamp).toHaveBeenCalledTimes(1);
    });

    it("warns when the stamp cannot be loaded and does not enter the mode", async () => {
        const failing = vi.fn(async () => {
            throw new Error("boom");
        });
        const { store } = mount({
            areas: [area("a1", "Sala")],
            fetchAreaStamp: failing,
        });

        act(() => cards()[0]?.click());
        await flush();

        expect(container.textContent).toContain(
            AREA_PLACEMENT_MESSAGES.LOAD_FAILED
        );
        expect(store.getState().placingArea).toBeNull();
    });
});
