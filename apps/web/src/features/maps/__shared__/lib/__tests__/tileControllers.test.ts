import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Cell, EditorModel } from "@standin/contracts";
import { createDraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import { createBrushController } from "@/features/maps/__shared__/lib/createBrushController";
import { createBucketController } from "@/features/maps/__shared__/lib/createBucketController";
import { createEraseController } from "@/features/maps/__shared__/lib/createEraseController";
import { createPickerController } from "@/features/maps/__shared__/lib/createPickerController";
import { createRectController } from "@/features/maps/__shared__/lib/createRectController";
import {
    buildTileModel,
    FLOOR_TILE,
    WALL_TILE,
} from "@/features/maps/__shared__/lib/__tests__/fixtures/buildTileModel";
import { EDITOR_LAYERS } from "@/features/maps/__shared__/consts/layers";
import { getCellGid } from "@/features/maps/__shared__/utils/getCellGid";
import { TILE_HINTS } from "@/features/maps/__shared__/consts/messages";
import type {
    ToolContext,
    ToolController,
} from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";

const preview = vi.hoisted(() => ({
    add: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock("@/features/maps/__shared__/lib/TilePreview", () => ({
    TilePreview: class {
        add = preview.add;
        set = preview.set;
        clear = preview.clear;
        destroy = preview.destroy;
    },
}));

const floor = { tilesetId: "ts-1", tileIndex: FLOOR_TILE };
const wall = { tilesetId: "ts-1", tileIndex: WALL_TILE };

const setup = (
    model: EditorModel,
    brush: typeof floor | null = floor,
    hiddenLayers: string[] = []
) => {
    const draft = createDraftStore(model);
    const dispatch = vi.spyOn(draft, "dispatchGesture");
    const hints: (string | null)[] = [];
    const layerVisibility = Object.fromEntries(
        EDITOR_LAYERS.map((layer) => [layer, !hiddenLayers.includes(layer)])
    );
    const state = { brush, layerVisibility };
    const store = {
        getState: () => state,
        subscribe: () => () => undefined,
        pickTile: vi.fn(),
    };
    const setHint = (text: string | null) => hints.push(text);
    const env = { scene: {}, store, setHint } as unknown as ToolEnv;

    const at = (cell: Cell, alt = false): ToolContext => ({
        cell,
        button: 0,
        alt,
        worldX: 0,
        worldY: 0,
        shift: false,
        ctrl: false,
        model: draft.getState().draft,
        dispatch: draft.dispatchGesture,
        setHint,
    });
    const gid = (layer: string, cell: Cell) =>
        getCellGid(draft.getState().draft.layout, layer, cell);

    return { draft, dispatch, hints, store, env, at, gid };
};

const drag = (
    controller: ToolController,
    at: (cell: Cell) => ToolContext,
    cells: Cell[]
) => {
    controller.onPointerDown?.(at(cells[0]));
    cells.slice(1).forEach((cell) => controller.onPointerMove?.(at(cell)));
    controller.onPointerUp?.(at(cells[cells.length - 1]));
};

describe("brush", () => {
    beforeEach(() => {
        Object.values(preview).forEach((fn) => fn.mockClear());
    });

    it("sends nothing until the button goes up, then one paint", () => {
        const { env, at, dispatch, gid } = setup(buildTileModel());
        const controller = createBrushController(env);

        controller.onPointerDown?.(at([0, 0]));
        controller.onPointerMove?.(at([3, 0]));
        expect(dispatch).not.toHaveBeenCalled();
        expect(preview.add).toHaveBeenCalledWith([
            [1, 0],
            [2, 0],
            [3, 0],
        ]);

        controller.onPointerUp?.(at([3, 0]));

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith([
            {
                type: "paint",
                layer: "ground",
                tilesetId: "ts-1",
                tileIndex: FLOOR_TILE,
                cells: [
                    [0, 0],
                    [1, 0],
                    [2, 0],
                    [3, 0],
                ],
            },
        ]);
        expect(gid("ground", [2, 0])).toBe(1);
        expect(preview.clear).toHaveBeenCalled();
    });

    it("paints a tile of a wall category on the walls layer", () => {
        const { env, at, dispatch } = setup(buildTileModel(), wall);

        drag(createBrushController(env), at, [[1, 1]]);

        expect(dispatch.mock.calls[0][0][0]).toMatchObject({ layer: "walls" });
    });

    it("undoes the whole stroke in one step", () => {
        const { env, at, draft, gid } = setup(buildTileModel());

        drag(createBrushController(env), at, [
            [0, 0],
            [2, 0],
        ]);
        expect(draft.getState().undo).toHaveLength(1);
        draft.undo();

        expect(gid("ground", [1, 0])).toBe(0);
    });

    it("sends nothing and clears the preview on cancel", () => {
        const { env, at, dispatch } = setup(buildTileModel());
        const controller = createBrushController(env);

        controller.onPointerDown?.(at([0, 0]));
        controller.onCancel?.();
        controller.onPointerUp?.(at([0, 0]));

        expect(dispatch).not.toHaveBeenCalled();
        expect(preview.clear).toHaveBeenCalled();
    });

    it("asks for a tile when there is no brush", () => {
        const { env, at, dispatch, hints } = setup(buildTileModel(), null);

        drag(createBrushController(env), at, [
            [0, 0],
            [1, 0],
        ]);

        expect(dispatch).not.toHaveBeenCalled();
        expect(hints).toContain(TILE_HINTS.NO_BRUSH);
    });

    it("skips the cells with a conflict and says why", () => {
        const model = buildTileModel({
            assets: [
                {
                    id: "chair",
                    placement: "GROUND",
                    footprint: { w: 1, h: 1, offsetX: 0 },
                },
            ],
            placed: [
                {
                    id: "p1",
                    assetId: "chair",
                    tileX: 1,
                    tileY: 0,
                    parentId: null,
                    propertyOverrides: null,
                },
            ],
        });
        const { env, at, dispatch, hints } = setup(model, wall);

        drag(createBrushController(env), at, [
            [0, 0],
            [2, 0],
        ]);

        expect(dispatch.mock.calls[0][0][0]).toMatchObject({
            cells: [
                [0, 0],
                [2, 0],
            ],
        });
        expect(hints.at(-1)).toContain("1 célula ignorada");
    });

    it("with Alt, picks the tile under the cursor and paints nothing", () => {
        const model = buildTileModel();
        const base = setup(model);
        drag(createBrushController(base.env), base.at, [[2, 2]]);
        const { env, at, store, dispatch } = setup(
            base.draft.getState().draft,
            null
        );

        const controller = createBrushController(env);
        controller.onPointerDown?.(at([2, 2], true));
        controller.onPointerMove?.(at([3, 2]));
        controller.onPointerUp?.(at([3, 2]));

        expect(store.pickTile).toHaveBeenCalledWith(floor);
        expect(dispatch).not.toHaveBeenCalled();
    });
});

describe("picker", () => {
    it("picks the tile and ignores an empty cell", () => {
        const base = setup(buildTileModel());
        drag(createBrushController(base.env), base.at, [[1, 1]]);
        const { env, at, store } = setup(base.draft.getState().draft, null);
        const controller = createPickerController(env);

        controller.onPointerDown?.(at([4, 4]));
        expect(store.pickTile).not.toHaveBeenCalled();

        controller.onPointerDown?.(at([1, 1]));
        expect(store.pickTile).toHaveBeenCalledWith(floor);
    });
});

describe("rectangle", () => {
    it("previews while dragging and paints the rectangle on release", () => {
        const { env, at, dispatch, gid } = setup(buildTileModel());
        const controller = createRectController(env);

        controller.onPointerDown?.(at([1, 1]));
        controller.onPointerMove?.(at([2, 2]));
        expect(dispatch).not.toHaveBeenCalled();
        expect(preview.set).toHaveBeenLastCalledWith([
            [1, 1],
            [2, 1],
            [1, 2],
            [2, 2],
        ]);
        controller.onPointerUp?.(at([2, 2]));

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(gid("ground", [2, 2])).toBe(1);
        expect(gid("ground", [3, 3])).toBe(0);
    });
});

describe("bucket", () => {
    it("fills the connected region in one operation", () => {
        const { env, at, dispatch, gid } = setup(buildTileModel());

        drag(createBucketController(env), at, [[0, 0]]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toHaveLength(1);
        expect(gid("ground", [5, 5])).toBe(1);
    });

    it("splits a big area in many operations of the same gesture", () => {
        const { env, at, dispatch, draft } = setup(
            buildTileModel({ size: 60 })
        );

        drag(createBucketController(env), at, [[0, 0]]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toHaveLength(2);
        expect(draft.getState().undo).toHaveLength(1);
        draft.undo();
        expect(draft.getState().ops).toEqual([]);
    });

    it("does nothing when the cell already has the tile", () => {
        const base = setup(buildTileModel());
        drag(createBucketController(base.env), base.at, [[0, 0]]);
        const { env, at, dispatch } = setup(base.draft.getState().draft);

        drag(createBucketController(env), at, [[3, 3]]);

        expect(dispatch).not.toHaveBeenCalled();
    });
});

describe("eraser", () => {
    it("erases in one operation on release", () => {
        const base = setup(buildTileModel());
        drag(createBrushController(base.env), base.at, [
            [0, 0],
            [2, 0],
        ]);
        const { env, at, dispatch, gid } = setup(
            base.draft.getState().draft,
            floor
        );

        const controller = createEraseController(env);
        controller.onPointerDown?.(at([0, 0]));
        controller.onPointerMove?.(at([1, 0]));
        expect(dispatch).not.toHaveBeenCalled();
        controller.onPointerUp?.(at([1, 0]));

        expect(dispatch).toHaveBeenCalledWith([
            {
                type: "erase",
                layer: "ground",
                cells: [
                    [0, 0],
                    [1, 0],
                ],
            },
        ]);
        expect(gid("ground", [0, 0])).toBe(0);
        expect(gid("ground", [2, 0])).toBe(1);
    });

    it("leaves a layer that is hidden alone", () => {
        const base = setup(buildTileModel());
        drag(createBrushController(base.env), base.at, [[0, 0]]);
        const { env, at, dispatch, gid } = setup(
            base.draft.getState().draft,
            floor,
            ["ground"]
        );

        drag(createEraseController(env), at, [[0, 0]]);

        expect(dispatch).not.toHaveBeenCalled();
        expect(gid("ground", [0, 0])).toBe(1);
    });

    it("does nothing on cells that are empty in every layer", () => {
        const { env, at, dispatch } = setup(buildTileModel(), floor);

        drag(createEraseController(env), at, [
            [0, 0],
            [1, 0],
        ]);

        expect(dispatch).not.toHaveBeenCalled();
    });
});
