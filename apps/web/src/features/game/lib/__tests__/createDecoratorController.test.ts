import { describe, expect, it, vi } from "vitest";
import type { EditorModel } from "@standin/contracts";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import { createDecoratorController } from "@/features/game/lib/createDecoratorController";
import { createDeskVeto } from "@/features/game/utils/createDeskVeto";
import { findOtherDeskClaim } from "@/features/game/utils/findOtherDeskClaim";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import {
    buildModel,
    crate,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

const ghost = vi.hoisted(() => ({
    show: vi.fn(),
    hide: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock("@/features/editor/lib/PlacementGhost", () => ({
    PlacementGhost: class {
        show = ghost.show;
        hide = ghost.hide;
        destroy = ghost.destroy;
    },
}));

vi.mock("@/features/editor/lib/HoverOutline", () => ({
    HoverOutline: class {
        show = vi.fn();
        hide = vi.fn();
        destroy = vi.fn();
    },
}));

// A crate on its own, a desk of mine and a desk of Ana, 3 tiles wide each.
const buildBase = (): EditorModel => {
    const model = buildModel([
        placedAt("crate-1", "crate", 0, 0),
        placedAt("d-mine", "desk", 2, 5),
        placedAt("d-ana", "desk", 6, 5),
        placedAt("mug", "monitor", 3, 5, "d-mine"),
    ]);
    return {
        ...model,
        library: {
            ...model.library,
            // Another model of the crate, so it can be swapped.
            assets: [...model.library.assets, { ...crate, id: "crate-b" }],
        },
        desks: [
            { mapAssetId: "d-mine", userId: "me" },
            { mapAssetId: "d-ana", userId: "ana" },
        ],
    };
};

const names = new Map([["ana", "Ana"]]);

const setup = () => {
    const store = createEditorStore();
    const draftStore = createDraftStore(buildBase());
    store.attachSelectionHost({
        getModel: () => draftStore.getState().draft,
        dispatch: draftStore.dispatchGesture,
    });
    const hints: (string | null)[] = [];
    const setHint = (text: string | null) => hints.push(text);
    const env = {
        scene: { textures: { exists: () => false } },
        store,
        setHint,
        veto: createDeskVeto({
            userId: "me",
            getUserName: (id) => names.get(id) ?? null,
        }),
    } as unknown as ToolEnv;
    const controller = createDecoratorController(
        env,
        (model, id) => findOtherDeskClaim(model, id, "me") !== null
    );
    controller.onActivate?.();

    // Ctrl is on so the pointer snaps to the grid, as the editor tests do.
    const at = (worldX: number, worldY: number): ToolContext => ({
        cell: [Math.floor(worldX / 32), Math.floor(worldY / 32)],
        worldX,
        worldY,
        button: 0,
        alt: false,
        shift: false,
        ctrl: true,
        model: draftStore.getState().draft,
        dispatch: draftStore.dispatchGesture,
        setHint,
    });
    const click = (worldX: number, worldY: number) => {
        const context = at(worldX, worldY);
        controller.onPointerDown?.(context);
        controller.onPointerUp?.(context);
    };
    const drag = (from: [number, number], to: [number, number]) => {
        controller.onPointerDown?.(at(...from));
        controller.onPointerMove?.(at(...to));
        controller.onPointerUp?.(at(...to));
    };
    return { store, draftStore, hints, click, drag, controller };
};

describe("createDecoratorController", () => {
    it("places the asset that was picked, as one place_asset", () => {
        const { store, draftStore, click } = setup();
        store.startPlacing("crate");

        click(5 * 32 + 4, 1 * 32 + 4);

        expect(draftStore.getState().ops).toEqual([
            expect.objectContaining({
                type: "place_asset",
                assetId: "crate",
            }),
        ]);
    });

    it("selects an object by a click and moves it by a drag, as one move_asset", () => {
        const { store, draftStore, click, drag } = setup();

        click(16, 16);
        expect(store.getState().selection).toEqual(["crate-1"]);

        drag([16, 16], [8 * 32 + 16, 1 * 32 + 16]);
        expect(draftStore.getState().ops).toEqual([
            expect.objectContaining({ type: "move_asset", id: "crate-1" }),
        ]);
    });

    it("swaps the selected object, as one replace_asset", () => {
        const { store, draftStore, click } = setup();
        click(16, 16);

        store.replaceSelection("crate-b");

        expect(draftStore.getState().ops).toEqual([
            {
                type: "replace_asset",
                id: "crate-1",
                assetId: "crate-b",
            },
        ]);
    });

    it("removes the selected object, as one remove_asset", () => {
        const { store, draftStore, click } = setup();
        click(16, 16);

        store.removeSelection();

        expect(draftStore.getState().ops).toEqual([
            { type: "remove_asset", id: "crate-1" },
        ]);
        expect(store.getState().selection).toEqual([]);
    });

    it("asks to confirm before removing the own desk, and sends releaseDesk once confirmed", () => {
        const { store, draftStore, click } = setup();
        click(2 * 32 + 16, 5 * 32 + 16);
        expect(store.getState().selection).toEqual(["d-mine"]);

        store.removeSelection();
        expect(draftStore.getState().ops).toEqual([]);
        expect(store.getState().pendingDeskRemoval).toEqual(["d-mine"]);

        store.confirmDeskRemoval();
        expect(draftStore.getState().ops).toEqual([
            { type: "remove_asset", id: "d-mine", releaseDesk: true },
        ]);
    });

    it("does not select the desk of someone else, so no tool acts on it", () => {
        const { store, draftStore, click } = setup();

        click(6 * 32 + 16, 5 * 32 + 16);

        expect(store.getState().selection).toEqual([]);
        store.removeSelection();
        store.replaceSelection("desk");
        expect(draftStore.getState().ops).toEqual([]);
    });

    it("refuses to drop an item on the desk of someone else, with the owner in the hint", () => {
        const { store, draftStore, hints, click, drag } = setup();
        // The mug stands above the top of the desk, so this point is only its.
        click(3 * 32 + 16, 5 * 32 - 8);
        expect(store.getState().selection).toEqual(["mug"]);

        drag([3 * 32 + 16, 5 * 32 - 8], [7 * 32 + 16, 5 * 32 + 16]);

        expect(draftStore.getState().ops).toEqual([]);
        expect(hints).toContain("Mesa de Ana");
    });

    it("shows the ghost as refused while placing on the desk of someone else", () => {
        const { store, hints, controller } = setup();
        store.startPlacing("crate");
        ghost.show.mockClear();

        const context: ToolContext = {
            cell: [6, 5],
            worldX: 6 * 32 + 16,
            worldY: 5 * 32 + 16,
            button: 0,
            alt: false,
            shift: false,
            ctrl: true,
            model: buildBase(),
            dispatch: () => ({ ok: true }),
            setHint: (text) => hints.push(text),
        };
        controller.onPointerMove?.(context);

        const [shown] = ghost.show.mock.calls.at(-1) ?? [];
        expect(shown?.valid).toBe(false);
    });
});
