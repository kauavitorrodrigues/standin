import { describe, expect, it, vi } from "vitest";
import { createSelectController } from "@/features/maps/__shared__/lib/createSelectController";
import type { ToolContext } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import {
    buildModel,
    placedAt,
} from "@/features/maps/__shared__/utils/__tests__/placementTestKit";

const ghost = vi.hoisted(() => ({
    show: vi.fn(),
    hide: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock("@/features/maps/__shared__/lib/PlacementGhost", () => ({
    PlacementGhost: class {
        show = ghost.show;
        hide = ghost.hide;
        destroy = ghost.destroy;
    },
}));

vi.mock("@/features/maps/__shared__/lib/ZonePreview", () => ({
    ZonePreview: class {
        showArea = vi.fn();
        showSpawn = vi.fn();
        hide = vi.fn();
        destroy = vi.fn();
    },
}));

const setup = (placing: string | null) => {
    let state = { placing, selection: [] as string[] };
    const listeners = new Set<() => void>();
    const store = {
        getState: () => state,
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        cancelPlacing: vi.fn(() => {
            state = { placing: null, selection: [] };
            listeners.forEach((listener) => listener());
        }),
        setSelection: vi.fn(),
        clearSelection: vi.fn(),
    };
    const setHint = vi.fn();
    const scene = { textures: { exists: () => false } };
    const env = { scene, store, setHint } as unknown as ToolEnv;
    const controller = createSelectController(env);
    controller.onActivate?.();

    const dispatch = vi.fn(() => ({ ok: true }) as const);
    const context: ToolContext = {
        cell: [3, 4],
        worldX: 100,
        worldY: 140,
        button: 0,
        alt: false,
        shift: false,
        ctrl: false,
        model: buildModel([placedAt("c", "crate", 2, 4)]),
        dispatch,
        setHint,
    };
    return { controller, store, dispatch, context };
};

describe("createSelectController", () => {
    it("places the asset when one is picked", () => {
        const { controller, dispatch, context, store } = setup("crate");

        controller.onPointerDown?.(context);
        controller.onPointerUp?.(context);

        expect(dispatch).toHaveBeenCalledWith([
            expect.objectContaining({ type: "place_asset", assetId: "crate" }),
        ]);
        expect(store.clearSelection).not.toHaveBeenCalled();
    });

    it("selects when nothing is being placed", () => {
        const { controller, dispatch, context, store } = setup(null);

        const pressed = { ...context, worldX: 70, worldY: 140 };
        controller.onPointerDown?.(pressed);
        controller.onPointerUp?.(pressed);

        expect(dispatch).not.toHaveBeenCalled();
        expect(store.setSelection).toHaveBeenCalledWith(["c"]);
    });

    it("Esc leaves the placing mode", () => {
        const { controller, store } = setup("crate");

        controller.onCancel?.();

        expect(store.cancelPlacing).toHaveBeenCalledTimes(1);
    });
});
