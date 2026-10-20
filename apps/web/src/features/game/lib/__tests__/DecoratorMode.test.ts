import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EditorModel, PlacedAsset } from "@standin/contracts";
import {
    buildModel,
    crate,
    desk,
    monitor,
    placedAt,
    wideItem,
} from "@/features/editor/utils/__tests__/placementTestKit";
import { MAP_CURSORS } from "@/features/game/consts/camera";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import { DecoratorMode } from "@/features/game/lib/DecoratorMode";
import type { MapScene } from "@/features/game/scenes/MapScene";

const router = vi.hoisted(() => ({ destroy: vi.fn() }));
const overlay = vi.hoisted(() => ({ destroy: vi.fn() }));
const tracker = vi.hoisted(() => ({ destroy: vi.fn() }));
const deskLock = vi.hoisted(() => ({ destroy: vi.fn() }));

vi.mock("@/features/editor/lib/EditorToolRouter", () => ({
    EditorToolRouter: vi.fn(function () {
        return router;
    }),
}));
vi.mock("@/features/editor/lib/SelectionOverlay", () => ({
    SelectionOverlay: vi.fn(function () {
        return overlay;
    }),
}));
vi.mock("@/features/editor/lib/SelectionAnchorTracker", () => ({
    SelectionAnchorTracker: vi.fn(function () {
        return tracker;
    }),
}));
vi.mock("@/features/editor/utils/bindToolInput", () => ({
    bindToolInput: () => () => () => undefined,
}));
vi.mock("@/features/game/lib/DeskLockHover", () => ({
    DeskLockHover: vi.fn(function () {
        return deskLock;
    }),
}));
vi.mock("@/features/game/lib/createDecoratorController", () => ({
    createDecoratorController: () => ({}),
}));

const placed = (id: string): PlacedAsset => placedAt(id, "crate", 1, 1);

const buildBase = (): EditorModel => buildModel([placed("a")]);

const IDENTITY = { userId: "me", getUserName: () => null };

const makeScene = () => {
    const style = { cursor: "pointer" };
    const scene = {
        getMapSize: () => ({ columns: 4, rows: 4 }),
        setDecoratorGuards: vi.fn(),
        setPlaced: vi.fn(),
        game: { canvas: { style } },
    };
    return { scene, style };
};

const start = () => {
    const { scene, style } = makeScene();
    const store = createEditorStore();
    const draftStore = createDraftStore(buildBase());
    const mode = new DecoratorMode(scene as unknown as MapScene, {
        store,
        draftStore,
        ...IDENTITY,
    });
    return { scene, style, store, draftStore, mode };
};

describe("DecoratorMode", () => {
    beforeEach(() => {
        router.destroy.mockClear();
        overlay.destroy.mockClear();
        tracker.destroy.mockClear();
        deskLock.destroy.mockClear();
    });

    it("selects the select tool and takes the camera drag on entering", () => {
        const { scene, store } = start();

        expect(store.getState().tool).toBe(EDITOR_TOOLS.SELECT);
        expect(scene.setDecoratorGuards).toHaveBeenCalledTimes(1);
        expect(scene.setDecoratorGuards.mock.calls[0]?.[0]).toHaveProperty(
            "canPan"
        );
    });

    it("draws the draft at once", () => {
        const { scene } = start();

        expect(scene.setPlaced).toHaveBeenCalledWith(
            [placed("a")],
            [crate, desk, monitor, wideItem],
            { animate: false }
        );
    });

    it("draws a gesture with the drop effect and a discard without it", () => {
        const { scene, draftStore } = start();
        scene.setPlaced.mockClear();

        draftStore.dispatchGesture([
            {
                type: "move_asset",
                id: "a",
                tileX: 2,
                tileY: 2,
                offsetX: 0,
                offsetY: 0,
            },
        ]);
        expect(scene.setPlaced.mock.calls[0]?.[2]).toEqual({ animate: true });

        draftStore.discard();
        expect(scene.setPlaced.mock.calls[1]?.[0]).toEqual([placed("a")]);
        expect(scene.setPlaced.mock.calls[1]?.[2]).toEqual({ animate: false });
    });

    it("lets the camera pan on the ground and holds it on an object", () => {
        const { scene, store } = start();
        const guards = scene.setDecoratorGuards.mock.calls[0]?.[0] as {
            canPan: () => boolean;
        };

        expect(guards.canPan()).toBe(true);
        store.setSelection(["a"]);
        expect(guards.canPan()).toBe(false);
        store.clearSelection();
        store.startPlacing("crate");
        expect(guards.canPan()).toBe(false);
    });

    it("gives the scene back on leaving", () => {
        const { scene, style, store, draftStore, mode } = start();
        store.setSelection(["a"]);
        scene.setPlaced.mockClear();

        mode.destroy();

        expect(router.destroy).toHaveBeenCalledTimes(1);
        expect(overlay.destroy).toHaveBeenCalledTimes(1);
        expect(tracker.destroy).toHaveBeenCalledTimes(1);
        expect(deskLock.destroy).toHaveBeenCalledTimes(1);
        expect(scene.setDecoratorGuards).toHaveBeenLastCalledWith(null);
        expect(scene.setPlaced).toHaveBeenCalledTimes(1);
        expect(scene.setPlaced.mock.calls[0]?.[0]).toEqual([placed("a")]);
        scene.setPlaced.mockClear();
        expect(store.getState().selection).toEqual([]);
        expect(style.cursor).toBe(MAP_CURSORS.IDLE);

        draftStore.dispatchGesture([]);
        draftStore.discard();
        draftStore.dispatchGesture([
            {
                type: "move_asset",
                id: "a",
                tileX: 3,
                tileY: 3,
                offsetX: 0,
                offsetY: 0,
            },
        ]);
        expect(scene.setPlaced).not.toHaveBeenCalled();
    });

    it("shows the published map again when it leaves with a draft not applied", () => {
        const { scene, draftStore, mode } = start();
        draftStore.dispatchGesture([
            {
                type: "move_asset",
                id: "a",
                tileX: 3,
                tileY: 3,
                offsetX: 0,
                offsetY: 0,
            },
        ]);
        scene.setPlaced.mockClear();

        mode.destroy();

        expect(scene.setPlaced).toHaveBeenCalledTimes(1);
        expect(scene.setPlaced.mock.calls[0]?.[0]).toEqual([placed("a")]);
    });

    it("selects the focused object and brings it into view", () => {
        const { scene } = makeScene();
        const withTextures = {
            ...scene,
            focusPoint: vi.fn(),
            textures: { exists: () => false },
        };
        const store = createEditorStore();
        const draftStore = createDraftStore(buildBase());

        new DecoratorMode(withTextures as unknown as MapScene, {
            store,
            draftStore,
            focusId: "a",
            ...IDENTITY,
        });

        expect(store.getState().selection).toEqual(["a"]);
        expect(withTextures.focusPoint).toHaveBeenCalledTimes(1);
    });

    it("leaves the view alone when the focused object is gone", () => {
        const { scene } = makeScene();
        const withTextures = {
            ...scene,
            focusPoint: vi.fn(),
            textures: { exists: () => false },
        };
        const store = createEditorStore();

        new DecoratorMode(withTextures as unknown as MapScene, {
            store,
            draftStore: createDraftStore(buildBase()),
            focusId: "missing",
            ...IDENTITY,
        });

        expect(store.getState().selection).toEqual([]);
        expect(withTextures.focusPoint).not.toHaveBeenCalled();
    });
});
