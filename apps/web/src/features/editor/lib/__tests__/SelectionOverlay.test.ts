import { describe, expect, it, vi } from "vitest";
import { SelectionOverlay } from "@/features/editor/lib/SelectionOverlay";

const drawObjectOutline = vi.fn();

vi.mock("phaser", () => ({
    default: { Textures: { Events: { ADD: "addtexture" } } },
}));
vi.mock("@/features/editor/utils/drawObjectOutline", () => ({
    drawObjectOutline: (...args: unknown[]) => drawObjectOutline(...args),
}));
vi.mock("@/features/editor/utils/createSceneObjectSurface", () => ({
    createSceneObjectSurface: () => ({ getFrameSize: () => null }),
}));
vi.mock("@/features/editor/utils/getObjectBounds", () => ({
    getObjectBounds: () => ({ x: 0, y: 0, width: 1, height: 1, depth: 0 }),
}));
vi.mock("@/features/editor/utils/createObjectLookup", () => ({
    createObjectLookup: () => ({
        placedById: new Map([
            ["a", { id: "a" }],
            ["b", { id: "b" }],
        ]),
    }),
}));

const setup = (draggedId: string | null) => {
    const graphics = {
        clear: vi.fn(),
        setDepth: vi.fn(),
        destroy: vi.fn(),
    };
    const scene = {
        add: { graphics: () => graphics },
        textures: { on: vi.fn(), off: vi.fn() },
    };
    const store = {
        getState: () => ({ selection: ["a", "b"], draggedId }),
        subscribe: () => () => undefined,
    };
    const draftStore = {
        getState: () => ({ draft: {} }),
        subscribe: () => () => undefined,
    };
    return new SelectionOverlay(
        scene as never,
        store as never,
        draftStore as never
    );
};

describe("SelectionOverlay", () => {
    it("draws every selected object when none is dragged", () => {
        drawObjectOutline.mockClear();
        setup(null);

        expect(drawObjectOutline).toHaveBeenCalledTimes(2);
    });

    it("leaves out the dragged object, since the ghost shows it", () => {
        drawObjectOutline.mockClear();
        setup("a");

        expect(drawObjectOutline).toHaveBeenCalledTimes(1);
    });
});
