// @vitest-environment jsdom
import { act, createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    buildBlankEditorModel,
    type AssetDefinition,
    type LibraryPalette,
} from "@standin/contracts";
import { DraftStoreProvider } from "@/features/editor/components/instances/DraftStoreProvider";
import { EditorStoreProvider } from "@/features/editor/components/instances/EditorStoreProvider";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import { AREA_CANVAS, AREA_FRAME_INITIAL } from "../../../consts/composer";
import { AreaWorkspace } from "../AreaWorkspace";

// The composer has no lock, no saved draft and no publish. Any module of
// those that gets loaded by the casco makes the import of it fail.
vi.mock("@/features/maps/__shared__/hooks/useEditorLock", () => {
    throw new Error("The composer must not take the map lock");
});
vi.mock("@/features/maps/__shared__/hooks/useLockRecovery", () => {
    throw new Error("The composer must not recover a lock");
});
vi.mock("@/features/maps/__shared__/hooks/useDraftPersistence", () => {
    throw new Error("The composer must not save a draft");
});
vi.mock("@/features/maps/__shared__/lib/draftDb", () => {
    throw new Error("The composer must not touch IndexedDB");
});
vi.mock("@/features/maps/__shared__/hooks/usePublishDraft", () => {
    throw new Error("The composer must not publish");
});

const engine = vi.hoisted(() => ({
    containerRef: vi.fn(),
    coordinatesRef: { current: null },
    hintRef: { current: null },
    toolbarRef: { current: null },
    zoneToolbarRef: { current: null },
    fitCamera: vi.fn(),
    focusCell: vi.fn(),
    captureThumbnail: vi.fn(),
    captureNativeSnapshot: vi.fn(),
    zoneNameRequest: null,
    confirmZoneName: vi.fn(),
    cancelZoneName: vi.fn(),
}));
const useEditorEngine = vi.hoisted(() => vi.fn());

vi.mock("@/features/editor/hooks/useEditorEngine", () => ({
    useEditorEngine: (...args: unknown[]) => useEditorEngine(...(args as [])),
}));
vi.mock("@/features/editor/hooks/useSceneSync", () => ({
    useSceneSync: () => ({ attachScene: vi.fn(), detachScene: vi.fn() }),
}));
vi.mock("@/features/tilesets/hooks/useUnsavedChangesGuard", () => ({
    useUnsavedChangesGuard: () => ({
        blocked: false,
        stay: vi.fn(),
        leave: vi.fn(),
        release: vi.fn(),
    }),
}));

vi.mock("@/lib/api/url", () => ({
    API_BASE_URL: "http://localhost",
    SOCKET_URL: "http://localhost",
    SOCKET_PATH_OPTIONS: {},
}));

const api = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
}));
vi.mock("@/lib/axios/api", () => ({ api }));

const table = {
    id: "table",
    type: "TABLE",
    placement: "GROUND",
    footprint: { w: 2, h: 1, offsetX: 0 },
} as AssetDefinition;
const library = {
    tilesets: [],
    assets: [table],
    categories: [],
    areas: [],
} as LibraryPalette;

let root: Root;
let container: HTMLElement;
let editorStore: EditorStore;
let draftStore: DraftStore;

const grab = (editor: EditorStore, draft: DraftStore) => {
    editorStore = editor;
    draftStore = draft;
};

const Capture = () => {
    const editor = useEditorStore();
    const draft = useDraftStore();
    useEffect(() => grab(editor, draft), [editor, draft]);
    return null;
};

const render = () => {
    const model = buildBlankEditorModel({ ...AREA_CANVAS, library });
    const map = { id: "area-composer", layout: model.layout } as never;
    const client = new QueryClient();
    act(() =>
        root.render(
            createElement(
                QueryClientProvider,
                { client },
                createElement(
                    EditorStoreProvider,
                    null,
                    createElement(
                        DraftStoreProvider,
                        { model, children: null },
                        createElement(Capture),
                        createElement(AreaWorkspace, {
                            map,
                            start: {
                                model,
                                frame: AREA_FRAME_INITIAL,
                                values: {
                                    name: "",
                                    createZone: true,
                                    zoneLabel: "",
                                },
                            },
                            palette: {
                                tilesets: [],
                                categories: [],
                                isLoading: false,
                                isError: false,
                            },
                            onExit: vi.fn(),
                        })
                    )
                )
            )
        )
    );
};

const text = () => container.textContent ?? "";

describe("AreaWorkspace", () => {
    const indexedDB = { open: vi.fn() };

    beforeEach(() => {
        useEditorEngine.mockReturnValue(engine);
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.stubGlobal("indexedDB", indexedDB);
        vi.stubGlobal("matchMedia", () => ({
            matches: false,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
        }));
        vi.stubGlobal(
            "IntersectionObserver",
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
                takeRecords() {
                    return [];
                }
            }
        );
        vi.stubGlobal(
            "ResizeObserver",
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
        );
        indexedDB.open.mockClear();
        Object.values(api).forEach((fn) => fn.mockClear());
        container = document.createElement("div");
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });

    it("opens with the name field, the zone box and the save bar", () => {
        render();

        expect(
            container.querySelector('input[aria-label="Nome da área"]')
        ).not.toBeNull();
        expect(text()).toContain("Criar zona de área ao colocar");
        expect(text()).toContain("Salvar");
        expect(text()).toContain("Descartar");
        expect(text()).toContain("Sem alterações");
    });

    it("has no tab of areas and no zone tool", () => {
        render();

        const labels = [...container.querySelectorAll("[aria-label]")].map(
            (element) => element.getAttribute("aria-label")
        );
        expect(labels).toContain("Objetos");
        expect(labels).toContain("Tiles");
        expect(labels).not.toContain("Áreas");
        expect(labels).not.toContain("Zonas");
        expect(labels).not.toContain("Alternar as zonas");
    });

    it("hands the engine the frame to draw", () => {
        render();

        const frame = useEditorEngine.mock.calls.at(-1)?.[2] as unknown as {
            store: { getRect: () => unknown };
            limits: unknown;
        };
        expect(frame.store.getRect()).toEqual(AREA_FRAME_INITIAL);
    });

    it("edits and undoes without a map route, a lock or IndexedDB", () => {
        render();

        act(() => {
            draftStore.dispatchGesture([
                {
                    type: "place_asset",
                    tempId: "t1",
                    assetId: "table",
                    tileX: 2,
                    tileY: 2,
                    offsetX: 0,
                    offsetY: 0,
                    parentId: null,
                },
            ]);
        });
        expect(draftStore.getState().draft.placed).toHaveLength(1);
        expect(editorStore.getState().draft.hasChanges).toBe(true);
        expect(text()).toContain("Alterações não salvas");

        act(() => {
            draftStore.undo();
        });
        expect(draftStore.getState().draft.placed).toHaveLength(0);

        expect(indexedDB.open).not.toHaveBeenCalled();
        Object.values(api).forEach((fn) => expect(fn).not.toHaveBeenCalled());
    });
});
