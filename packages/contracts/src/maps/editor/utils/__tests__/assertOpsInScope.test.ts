import { describe, expect, it } from "vitest";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import { assertOpsInScope } from "../assertOpsInScope";

const ME = { userId: "me" };

const object = (
    id: string,
    assetId: string,
    parentId: string | null = null
) => ({
    id,
    assetId,
    tileX: 0,
    tileY: 0,
    offsetX: 0,
    offsetY: 0,
    parentId,
    propertyOverrides: null,
});

// d-mine: my desk with a vase on it. d-other: a desk of someone else with a
// vase on it. d-free: a desk nobody claimed. crate: a plain floor object.
const model = {
    mapId: "m",
    width: 20,
    height: 20,
    version: 1,
    layout: {},
    limits: { objectsUsed: 8, objectsMax: 100 },
    library: {
        tilesets: [],
        categories: [],
        areas: [],
        assets: [
            { id: "desk", placement: "GROUND" },
            { id: "vase", placement: "SURFACE" },
            { id: "crate", placement: "GROUND" },
        ],
    },
    desks: [
        { mapAssetId: "d-mine", userId: "me" },
        { mapAssetId: "d-other", userId: "other" },
    ],
    placed: [
        object("d-mine", "desk"),
        object("v-mine", "vase", "d-mine"),
        object("d-other", "desk"),
        object("v-other", "vase", "d-other"),
        object("d-free", "desk"),
        object("v-free", "vase", "d-free"),
        object("crate-1", "crate"),
    ],
} as unknown as EditorModel;

const objects = { kind: "objects" } as const;
const map = { kind: "map" } as const;

const codes = (ops: EditorOp[], scope: typeof objects | typeof map) =>
    assertOpsInScope(ops, scope, ME, model).map(
        ({ opIndex, code }) => `${opIndex}:${code}`
    );

describe("assertOpsInScope by scope", () => {
    const mapLevelOps: EditorOp[] = [
        {
            type: "paint",
            layer: "ground",
            tilesetId: "t",
            tileIndex: 0,
            cells: [[0, 0]],
        },
        { type: "erase", layer: "ground", cells: [[0, 0]] },
        {
            type: "paint_tiles",
            layer: "ground",
            tiles: [{ tilesetId: "t", tileIndex: 0, cells: [[0, 0]] }],
        },
        {
            type: "set_zone",
            zone: { kind: "spawn", x: 1, y: 1, w: 1, h: 1 },
        } as unknown as EditorOp,
        { type: "remove_zone", zoneId: 1 },
        { type: "set_background", color: "#000000" },
    ];

    it.each(mapLevelOps.map((op) => [op.type, op] as const))(
        "refuses %s in the objects scope",
        (_type, op) => {
            expect(codes([op], objects)).toEqual(["0:OUT_OF_SCOPE"]);
        }
    );

    it.each(mapLevelOps.map((op) => [op.type, op] as const))(
        "lets %s through in the map scope",
        (_type, op) => {
            expect(codes([op], map)).toEqual([]);
        }
    );

    it("reports the index of each refused operation", () => {
        const ops: EditorOp[] = [
            { type: "move_asset", id: "crate-1", tileX: 1, tileY: 1 },
            { type: "remove_zone", zoneId: 1 },
            { type: "set_background", color: "#fff000" },
        ];

        expect(codes(ops, objects)).toEqual([
            "1:OUT_OF_SCOPE",
            "2:OUT_OF_SCOPE",
        ]);
    });

    it("accepts every object operation on a plain object in both scopes", () => {
        const ops: EditorOp[] = [
            { type: "move_asset", id: "crate-1", tileX: 1, tileY: 1 },
            { type: "replace_asset", id: "crate-1", assetId: "crate" },
            { type: "remove_asset", id: "crate-1" },
            {
                type: "place_asset",
                tempId: "t1",
                assetId: "crate",
                tileX: 2,
                tileY: 2,
            },
        ];

        expect(codes(ops, objects)).toEqual([]);
        expect(codes(ops, map)).toEqual([]);
    });
});

describe("assertOpsInScope by desk", () => {
    const cases: [string, EditorOp, string[]][] = [
        [
            "moves an own desk",
            { type: "move_asset", id: "d-mine", tileX: 5, tileY: 5 },
            [],
        ],
        [
            "replaces an own desk",
            { type: "replace_asset", id: "d-mine", assetId: "desk" },
            [],
        ],
        [
            "moves an item on an own desk",
            { type: "move_asset", id: "v-mine", tileX: 5, tileY: 5 },
            [],
        ],
        [
            "removes an item on an own desk",
            { type: "remove_asset", id: "v-mine" },
            [],
        ],
        [
            "places an item on an own desk",
            {
                type: "place_asset",
                tempId: "t1",
                assetId: "vase",
                tileX: 0,
                tileY: 0,
                parentId: "d-mine",
            },
            [],
        ],
        [
            "removes an own desk with releaseDesk",
            { type: "remove_asset", id: "d-mine", releaseDesk: true },
            [],
        ],
        [
            "removes an own desk without releaseDesk",
            { type: "remove_asset", id: "d-mine" },
            ["0:DESK_CLAIMED"],
        ],
        [
            "moves a desk of someone else",
            { type: "move_asset", id: "d-other", tileX: 5, tileY: 5 },
            ["0:DESK_CLAIMED"],
        ],
        [
            "replaces a desk of someone else",
            { type: "replace_asset", id: "d-other", assetId: "desk" },
            ["0:DESK_CLAIMED"],
        ],
        [
            "removes a desk of someone else, even with releaseDesk",
            { type: "remove_asset", id: "d-other", releaseDesk: true },
            ["0:DESK_CLAIMED"],
        ],
        [
            "moves an item on a desk of someone else",
            { type: "move_asset", id: "v-other", tileX: 5, tileY: 5 },
            ["0:DESK_CLAIMED"],
        ],
        [
            "replaces an item on a desk of someone else",
            { type: "replace_asset", id: "v-other", assetId: "vase" },
            ["0:DESK_CLAIMED"],
        ],
        [
            "removes an item on a desk of someone else",
            { type: "remove_asset", id: "v-other" },
            ["0:DESK_CLAIMED"],
        ],
        [
            "places an item on a desk of someone else",
            {
                type: "place_asset",
                tempId: "t1",
                assetId: "vase",
                tileX: 0,
                tileY: 0,
                parentId: "d-other",
            },
            ["0:DESK_CLAIMED"],
        ],
        [
            "moves an own item onto a desk of someone else",
            {
                type: "move_asset",
                id: "v-mine",
                tileX: 0,
                tileY: 0,
                parentId: "d-other",
            },
            ["0:DESK_CLAIMED"],
        ],
        [
            "moves a free desk",
            { type: "move_asset", id: "d-free", tileX: 5, tileY: 5 },
            [],
        ],
        ["removes a free desk", { type: "remove_asset", id: "d-free" }, []],
        [
            "removes an item on a free desk",
            { type: "remove_asset", id: "v-free" },
            [],
        ],
    ];

    it.each(cases)("%s, in the objects scope", (_name, op, expected) => {
        expect(codes([op], objects)).toEqual(expected);
    });

    it.each(cases)("%s, in the map scope", (_name, op, expected) => {
        expect(codes([op], map)).toEqual(expected);
    });
});

describe("assertOpsInScope with ids created in the list", () => {
    it("refuses an item placed on a tempId that sits on a desk of someone else", () => {
        const ops: EditorOp[] = [
            {
                type: "place_asset",
                tempId: "tray",
                assetId: "crate",
                tileX: 0,
                tileY: 0,
                parentId: "d-free",
            },
            {
                type: "move_asset",
                id: "tray",
                tileX: 0,
                tileY: 0,
                parentId: "d-other",
            },
            {
                type: "place_asset",
                tempId: "cup",
                assetId: "vase",
                tileX: 0,
                tileY: 0,
                parentId: "tray",
            },
        ];

        expect(codes(ops, objects)).toEqual([
            "1:DESK_CLAIMED",
            "2:DESK_CLAIMED",
        ]);
    });

    it("accepts an item placed on a tempId that sits on an own desk", () => {
        const ops: EditorOp[] = [
            {
                type: "place_asset",
                tempId: "tray",
                assetId: "crate",
                tileX: 0,
                tileY: 0,
                parentId: "d-mine",
            },
            {
                type: "place_asset",
                tempId: "cup",
                assetId: "vase",
                tileX: 0,
                tileY: 0,
                parentId: "tray",
            },
            { type: "move_asset", id: "cup", tileX: 1, tileY: 1 },
        ];

        expect(codes(ops, objects)).toEqual([]);
    });

    it("does not mutate the model", () => {
        const before = structuredClone(model);
        codes([{ type: "remove_asset", id: "d-mine" }], objects);

        expect(model).toEqual(before);
    });
});
