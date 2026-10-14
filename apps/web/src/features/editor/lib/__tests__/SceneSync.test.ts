import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
    EditorModel,
    LibraryPalette,
    MapLayout,
} from "@standin/contracts";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import { createSceneSync } from "@/features/editor/lib/SceneSync";
import type { SceneSyncTarget } from "@/features/editor/types/SceneSyncTarget";
import { DEFAULT_EDITOR_VIEW_PREFERENCES } from "@/features/editor/consts/editorViewPreferences";
import { editorViewPreference } from "@/features/editor/lib/editorViewPreferences";
// The view choices are remembered across editors, so each case starts from the defaults.
beforeEach(() => {
    editorViewPreference.set(DEFAULT_EDITOR_VIEW_PREFERENCES);
});

const buildBase = (): EditorModel => ({
    mapId: "map-1",
    width: 4,
    height: 4,
    layout: {
        width: 4,
        height: 4,
        layers: [],
        tilesets: [],
    } as unknown as MapLayout,
    placed: [],
    library: {
        tilesets: [],
        assets: [],
        categories: [],
    } as unknown as LibraryPalette,
    desks: [],
    limits: { objectsUsed: 0, objectsMax: 10 },
    version: 1,
});

const color = (value: string) => ({
    type: "set_background" as const,
    color: value,
});

const buildScene = () => {
    const releases: (() => void)[] = [];
    const scene = {
        syncObjects: vi.fn(),
        setZones: vi.fn(),
        setZonesVisible: vi.fn(),
        syncTiles: vi.fn(() => Promise.resolve()),
    } satisfies SceneSyncTarget;
    const slowTiles = () =>
        scene.syncTiles.mockImplementation(
            () => new Promise<void>((resolve) => releases.push(resolve))
        );
    return { scene, releases, slowTiles };
};

const setup = () => {
    const draftStore = createDraftStore(buildBase());
    const editorStore = createEditorStore();
    const sync = createSceneSync(draftStore, editorStore);
    const fake = buildScene();
    sync.start();
    return { draftStore, editorStore, sync, ...fake };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("SceneSync drop effect", () => {
    const lastOptions = (scene: ReturnType<typeof buildScene>["scene"]) =>
        scene.syncObjects.mock.calls.at(-1)?.[2];

    it("animates after a gesture of the user", async () => {
        const { draftStore, sync, scene } = setup();
        sync.attach(scene);
        await flush();

        draftStore.dispatchGesture([color("#111111")]);
        await flush();

        expect(lastOptions(scene)).toEqual({ animate: true });
    });

    it("does not animate after undo, redo or the first draw", async () => {
        const { draftStore, sync, scene } = setup();
        sync.attach(scene);
        await flush();
        expect(lastOptions(scene)).toEqual({ animate: false });

        draftStore.dispatchGesture([color("#111111")]);
        await flush();
        draftStore.undo();
        await flush();
        expect(lastOptions(scene)).toEqual({ animate: false });

        draftStore.redo();
        await flush();
        expect(lastOptions(scene)).toEqual({ animate: false });
    });
});

describe("SceneSync", () => {
    it("calls the scene once per draft change", async () => {
        const { draftStore, sync, scene } = setup();
        sync.attach(scene);
        await flush();
        scene.syncObjects.mockClear();
        scene.syncTiles.mockClear();
        scene.setZones.mockClear();

        draftStore.dispatchGesture([color("#111111")]);
        await flush();

        expect(scene.syncObjects).toHaveBeenCalledTimes(1);
        expect(scene.syncTiles).toHaveBeenCalledTimes(1);
        expect(scene.setZones).toHaveBeenCalledTimes(1);
    });

    it("sends undo, redo and discard to the scene", async () => {
        const { draftStore, sync, scene } = setup();
        sync.attach(scene);
        await flush();
        draftStore.dispatchGesture([color("#111111")]);
        await flush();
        scene.syncTiles.mockClear();

        draftStore.undo();
        await flush();
        draftStore.redo();
        await flush();
        draftStore.discard();
        await flush();

        expect(scene.syncTiles).toHaveBeenCalledTimes(3);
        const last = scene.syncTiles.mock.calls.at(-1) as unknown[] | undefined;
        expect(last?.[0]).toBe(draftStore.getState().base.layout);
    });

    it("coalesces changes that arrive while tiles are syncing", async () => {
        const { draftStore, sync, scene, releases, slowTiles } = setup();
        sync.attach(scene);
        await flush();
        scene.syncTiles.mockClear();
        slowTiles();

        draftStore.dispatchGesture([color("#111111")]);
        draftStore.dispatchGesture([color("#222222")]);
        draftStore.dispatchGesture([color("#333333")]);
        expect(scene.syncTiles).toHaveBeenCalledTimes(1);

        releases.shift()?.();
        await flush();
        expect(scene.syncTiles).toHaveBeenCalledTimes(2);
        const last = scene.syncTiles.mock.calls.at(-1) as unknown[] | undefined;
        expect(last?.[0]).toBe(draftStore.getState().draft.layout);
        releases.shift()?.();
        await flush();
        expect(scene.syncTiles).toHaveBeenCalledTimes(2);
    });

    it("gives the draft to a scene that attaches late", async () => {
        const { draftStore, sync, scene } = setup();
        draftStore.dispatchGesture([color("#111111")]);
        expect(scene.syncTiles).not.toHaveBeenCalled();

        sync.attach(scene);
        await flush();

        expect(scene.syncTiles).toHaveBeenCalledTimes(1);
    });

    it("applies the zones toggle", () => {
        const { editorStore, sync, scene } = setup();
        sync.attach(scene);
        scene.setZonesVisible.mockClear();

        editorStore.toggleZones();

        expect(scene.setZonesVisible).toHaveBeenCalledTimes(1);
        expect(scene.setZonesVisible).toHaveBeenCalledWith(false);
    });

    it("stops calling the scene after stop and detach", async () => {
        const { draftStore, editorStore, sync, scene } = setup();
        sync.attach(scene);
        await flush();
        scene.syncTiles.mockClear();
        scene.setZonesVisible.mockClear();

        sync.stop();
        draftStore.dispatchGesture([color("#111111")]);
        editorStore.toggleZones();
        await flush();

        expect(scene.syncTiles).not.toHaveBeenCalled();
        expect(scene.setZonesVisible).not.toHaveBeenCalled();
    });

    it("does not reach a detached scene with a pending change", async () => {
        const { draftStore, sync, scene, releases, slowTiles } = setup();
        sync.attach(scene);
        await flush();
        scene.syncTiles.mockClear();
        slowTiles();

        draftStore.dispatchGesture([color("#111111")]);
        draftStore.dispatchGesture([color("#222222")]);
        sync.detach();
        releases.shift()?.();
        await flush();

        expect(scene.syncTiles).toHaveBeenCalledTimes(1);
    });

    it("keeps going after a failing call", async () => {
        const { draftStore, sync, scene } = setup();
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        sync.attach(scene);
        await flush();
        scene.syncObjects.mockImplementation(() => {
            throw new Error("boom");
        });
        scene.syncTiles.mockClear();

        draftStore.dispatchGesture([color("#111111")]);
        await flush();
        draftStore.dispatchGesture([color("#222222")]);
        await flush();

        expect(scene.syncTiles).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});
