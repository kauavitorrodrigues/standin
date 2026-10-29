import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";
import { createRoom } from "../builders/createRoom";
import { createZone } from "../builders/createZone";
import { paintFloor } from "../builders/paintFloor";
import { placeDesk } from "../builders/placeDesk";
import { placeDoor } from "../builders/placeDoor";
import { placeObject } from "../builders/placeObject";
import { setSpawn } from "../builders/setSpawn";
import { composeOps } from "../compose/composeOps";
import { compileSpec } from "../spec/compile/compileSpec";
import { parseSpec } from "../spec/parseSpec";
import { validateSpec } from "../spec/validateSpec";
import { validateOps } from "../validate/validateOps";
import type { Spec } from "../types";
import { buildLibrary, buildModel } from "./kit";

const EXAMPLES = path.join(__dirname, "..", "..", "examples");
const DOC = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "docs",
    "authoring-spec.md"
);

const readExample = (file: string) =>
    readFileSync(path.join(EXAMPLES, file), "utf8");

const load = (text: string): Spec => {
    const parsed = parseSpec(text);
    expect(parsed.ok).toBe(true);
    const valid = validateSpec(parsed.ok ? parsed.value : null);
    expect(valid.ok).toBe(true);
    return (valid as { ok: true; spec: Spec }).spec;
};

const issuesOf = (input: unknown) => {
    const result = validateSpec(input);
    expect(result.ok).toBe(false);
    return result.ok ? [] : result.issues;
};

const miniMap = {
    kind: "map",
    sizeTier: "S",
    spawns: [{ x: 1, y: 1 }],
};

describe("parseSpec", () => {
    it("reads YAML and JSON to the same value", () => {
        const yaml = parseSpec(
            "kind: map\nsizeTier: S\nspawns:\n  - { x: 1, y: 2 }\n"
        );
        const json = parseSpec(
            '{"kind":"map","sizeTier":"S","spawns":[{"x":1,"y":2}]}'
        );

        expect(yaml).toEqual({ ok: true, value: expect.any(Object) });
        expect(json).toEqual(yaml);
    });

    it("answers a syntax error as an issue", () => {
        const result = parseSpec("kind: [map");

        expect(result).toMatchObject({
            ok: false,
            issues: [{ code: "AUTHORING_SPEC_PARSE_ERROR", path: "" }],
        });
    });

    it("refuses a key repeated in one mapping", () => {
        const result = parseSpec("kind: map\nkind: area\n");

        expect(result.ok).toBe(false);
    });

    it("answers an empty text as an empty value", () => {
        expect(parseSpec("")).toEqual({ ok: true, value: null });
    });
});

describe("validateSpec", () => {
    it("refuses an empty spec", () => {
        for (const input of [null, undefined, {}]) {
            expect(issuesOf(input)).toEqual([
                expect.objectContaining({ code: "AUTHORING_SPEC_EMPTY" }),
            ]);
        }
    });

    it("refuses a kind that does not exist", () => {
        expect(issuesOf({ kind: "world" })).toEqual([
            expect.objectContaining({ path: "kind" }),
        ]);
    });

    it("points at an unknown field", () => {
        const issues = issuesOf({
            ...miniMap,
            rooms: [
                {
                    key: "a",
                    label: "A",
                    x: 1,
                    y: 1,
                    width: 4,
                    height: 4,
                    colour: "red",
                },
            ],
        });

        expect(issues).toEqual([
            expect.objectContaining({
                code: "AUTHORING_SPEC_UNKNOWN_FIELD",
                path: "rooms[0].colour",
            }),
        ]);
    });

    it("points at an unknown door side", () => {
        const issues = issuesOf({
            ...miniMap,
            rooms: [
                { key: "a", label: "A", x: 1, y: 1, width: 4, height: 4 },
                {
                    key: "b",
                    label: "B",
                    x: 6,
                    y: 1,
                    width: 4,
                    height: 4,
                    doors: [{ side: "up", door: "door-n" }],
                },
            ],
        });

        expect(issues).toEqual([
            expect.objectContaining({
                code: "AUTHORING_SPEC_INVALID_VALUE",
                path: "rooms[1].doors[0].side",
            }),
        ]);
    });

    it("points at values out of range", () => {
        const issues = issuesOf({
            ...miniMap,
            sizeTier: "XXL",
            objects: [{ asset: "crate", x: -1, y: 200, offsetX: 99 }],
        });

        expect(issues.map(({ path, code }) => [path, code])).toEqual([
            ["sizeTier", "AUTHORING_SPEC_INVALID_VALUE"],
            ["objects[0].x", "AUTHORING_SPEC_OUT_OF_RANGE"],
            ["objects[0].y", "AUTHORING_SPEC_OUT_OF_RANGE"],
            ["objects[0].offsetX", "AUTHORING_SPEC_OUT_OF_RANGE"],
        ]);
    });

    it("points at a wrong type", () => {
        const issues = issuesOf({ ...miniMap, rooms: "none" });

        expect(issues).toEqual([
            expect.objectContaining({
                code: "AUTHORING_SPEC_INVALID_TYPE",
                path: "rooms",
            }),
        ]);
    });

    it("refuses walls with both a style and a tile", () => {
        const issues = issuesOf({
            ...miniMap,
            style: {
                walls: { tileset: "brick", style: "Brick", tileIndex: 1 },
            },
        });

        expect(issues).toEqual([
            expect.objectContaining({ path: "style.walls" }),
        ]);
    });

    it("refuses a repeated room key", () => {
        const room = { key: "a", label: "A", x: 1, y: 1, width: 4, height: 4 };
        const issues = issuesOf({
            ...miniMap,
            rooms: [room, { ...room, x: 8 }],
        });

        expect(issues).toEqual([
            expect.objectContaining({
                code: "AUTHORING_SPEC_DUPLICATE_ROOM_KEY",
                path: "rooms[1].key",
            }),
        ]);
    });
});

describe("compileSpec", () => {
    it("fails with the path of an unknown asset key", () => {
        const spec = load(
            "kind: map\nsizeTier: S\nobjects:\n  - { asset: crate, x: 1, y: 1 }\n  - { asset: ghost, x: 3, y: 3 }\nspawns:\n  - { x: 1, y: 1 }\n"
        );
        const result = compileSpec(spec, { base: buildModel() });

        expect(result).toMatchObject({
            ok: false,
            issues: [
                {
                    code: "AUTHORING_UNKNOWN_KEY",
                    path: "objects[1].asset",
                },
            ],
        });
    });

    it("fails with the path of an unknown tileset", () => {
        const spec = load(
            "kind: map\nsizeTier: S\nstyle:\n  floor: { tileset: nowhere, tileIndex: 0 }\nrooms:\n  - { key: a, label: A, x: 2, y: 2, width: 5, height: 5 }\n"
        );
        const result = compileSpec(spec, {
            base: buildModel(),
            requireSpawn: false,
        });

        expect(result).toMatchObject({
            ok: false,
            issues: [{ path: "style.floor.tileset" }],
        });
    });

    it("points a door at the room it belongs to", () => {
        const spec = load(
            "kind: map\nsizeTier: S\nrooms:\n  - { key: a, label: A, x: 2, y: 2, width: 5, height: 5 }\n  - key: b\n    label: B\n    x: 10\n    y: 2\n    width: 5\n    height: 5\n    doors:\n      - { side: south, door: ghost }\n"
        );
        const result = compileSpec(spec, {
            base: buildModel(),
            requireSpawn: false,
        });

        expect(result).toMatchObject({
            ok: false,
            issues: [{ path: "rooms[1].doors[0].door" }],
        });
    });

    it("refuses a room outside the map", () => {
        const spec = load(
            "kind: map\nsizeTier: S\nrooms:\n  - { key: a, label: A, x: 28, y: 2, width: 5, height: 5 }\n"
        );
        const result = compileSpec(spec, {
            base: buildModel(),
            requireSpawn: false,
        });

        expect(result).toMatchObject({
            ok: false,
            issues: [{ code: "CELL_OUT_OF_BOUNDS", path: "rooms[0]" }],
        });
    });

    it("refuses a zone outside the map", () => {
        const spec = load(
            "kind: map\nsizeTier: S\nzones:\n  - { label: Z, x: 29, y: 19, width: 4, height: 4 }\n"
        );
        const result = compileSpec(spec, {
            base: buildModel(),
            requireSpawn: false,
        });

        expect(result).toMatchObject({
            ok: false,
            issues: [{ path: "zones[0]" }],
        });
    });

    it("asks for a spawn on a map, and not on a template or an area", () => {
        const map = load("kind: map\nsizeTier: S\nname: Empty\n");
        const template = load("kind: template\nsizeTier: S\n");
        const area = load("kind: area\nsize: { width: 4, height: 4 }\n");

        expect(compileSpec(map, { base: buildModel() })).toMatchObject({
            ok: false,
            issues: [{ path: "spawns" }],
        });
        expect(
            compileSpec(map, { base: buildModel(), requireSpawn: false }).ok
        ).toBe(true);
        expect(compileSpec(template, { base: buildModel() }).ok).toBe(true);
        expect(compileSpec(area, { library: buildLibrary() }).ok).toBe(true);
    });

    it("needs a base for a map and a library for an area", () => {
        const map = load("kind: map\nsizeTier: S\n");
        const area = load("kind: area\nsize: { width: 4, height: 4 }\n");

        expect(compileSpec(map)).toMatchObject({
            ok: false,
            issues: [{ code: "AUTHORING_SPEC_BASE_MISSING" }],
        });
        expect(compileSpec(area)).toMatchObject({
            ok: false,
            issues: [{ code: "AUTHORING_SPEC_BASE_MISSING" }],
        });
    });

    it("refuses a map that does not fit the size tier", () => {
        const spec = load("kind: template\nsizeTier: XS\n");
        const result = compileSpec(spec, { base: buildModel(30, 20) });

        expect(result).toMatchObject({
            ok: false,
            issues: [
                { code: "AUTHORING_SPEC_SIZE_TIER_MISMATCH", path: "sizeTier" },
            ],
        });
    });

    it("gives the same ops for the same spec", () => {
        const text = readExample("office.yaml");
        const first = compileSpec(load(text), { base: buildModel() });
        const second = compileSpec(load(text), { base: buildModel() });

        expect(first.ok).toBe(true);
        expect(second).toEqual(first);
    });

    it("gives the ops of the builders called by hand", () => {
        const spec = load(
            [
                "kind: map",
                "sizeTier: S",
                "style:",
                "  floor: { tileset: floor, tileIndex: 0 }",
                "  walls: { tileset: brick, style: Brick }",
                "floors:",
                "  - { tileset: floor, tileIndex: 1, from: { x: 0, y: 13 }, to: { x: 5, y: 14 } }",
                "rooms:",
                "  - key: office",
                "    label: Office",
                "    x: 4",
                "    y: 4",
                "    width: 10",
                "    height: 8",
                "    doors:",
                "      - { side: south, door: door-s }",
                "zones:",
                "  - { label: Lounge, x: 4, y: 15, width: 6, height: 4 }",
                "desks:",
                "  - asset: desk",
                "    x: 6",
                "    y: 7",
                "    items: [{ asset: monitor, x: 6, y: 7 }]",
                "    chairs: [{ asset: chair, x: 6, y: 8, offsetY: 3 }]",
                "objects:",
                "  - { asset: crate, x: 11, y: 6, offsetX: 2 }",
                "spawns:",
                "  - { x: 8, y: 16, label: Entrance }",
            ].join("\n")
        );
        const compiled = compileSpec(spec, { base: buildModel() });

        const byHand = composeOps(
            buildModel(),
            [
                (m) =>
                    paintFloor(m, {
                        from: [0, 13],
                        to: [5, 14],
                        tileset: "floor",
                        tileIndex: 1,
                    }),
                (m) =>
                    createRoom(m, {
                        key: "office",
                        label: "Office",
                        x: 4,
                        y: 4,
                        width: 10,
                        height: 8,
                        walls: { tileset: "brick", style: "Brick" },
                        floor: { tileset: "floor", tileIndex: 0 },
                    }),
                (m) =>
                    placeDoor(m, {
                        room: "office",
                        side: "south",
                        door: "door-s",
                    }),
                (m) =>
                    createZone(m, {
                        label: "Lounge",
                        x: 4,
                        y: 15,
                        width: 6,
                        height: 4,
                    }),
                (m) =>
                    placeDesk(m, {
                        desk: "desk",
                        tileX: 6,
                        tileY: 7,
                        items: [{ asset: "monitor", tileX: 6, tileY: 7 }],
                        chairs: [
                            { asset: "chair", tileX: 6, tileY: 8, offsetY: 3 },
                        ],
                    }),
                (m) =>
                    placeObject(m, {
                        asset: "crate",
                        tileX: 11,
                        tileY: 6,
                        offsetX: 2,
                    }),
                (m) => setSpawn(m, { tileX: 8, tileY: 16, label: "Entrance" }),
            ],
            { requireSpawn: true }
        );

        expect(compiled.ok).toBe(true);
        expect(byHand.ok).toBe(true);
        expect(compiled.ok && byHand.ok && compiled.ops).toEqual(
            byHand.ok ? byHand.ops : []
        );
    });

    it("lets a room set its own walls over the style", () => {
        const spec = load(
            "kind: map\nsizeTier: S\nstyle:\n  walls: { tileset: brick, style: Brick }\nrooms:\n  - key: a\n    label: A\n    x: 2\n    y: 2\n    width: 5\n    height: 5\n    walls: { tileset: broken, style: Broken }\n"
        );
        const result = compileSpec(spec, {
            base: buildModel(),
            requireSpawn: false,
        });

        expect(result).toMatchObject({
            ok: false,
            issues: [{ code: "WALL_STYLE_INCOMPLETE", path: "rooms[0]" }],
        });
    });
});

describe("the examples", () => {
    const files = readdirSync(EXAMPLES).filter((file) =>
        /\.(ya?ml|json)$/.test(file)
    );

    it("has the examples the document names", () => {
        expect(files.sort()).toEqual([
            "area.yaml",
            "office.json",
            "office.yaml",
            "template.yaml",
        ]);
    });

    it.each(files)("%s compiles to ops that pass the dry run", (file) => {
        const spec = load(readExample(file));
        const compiled = compileSpec(spec, {
            base: buildModel(),
            library: buildLibrary(),
        });

        expect(compiled).toMatchObject({ ok: true });
        const ops = (compiled as { ops: EditorOp[] }).ops;
        expect(ops.length).toBeGreaterThan(0);
        if (spec.kind === "area") return;

        expect(
            validateOps(buildModel(), ops, {
                requireSpawn: spec.kind === "map",
            }).ok
        ).toBe(true);
    });

    it("compiles the office with several rooms, doors, desks and objects", () => {
        const spec = load(readExample("office.yaml"));
        const compiled = compileSpec(spec, { base: buildModel() });

        expect(compiled.ok).toBe(true);
        const types = compiled.ok ? compiled.ops.map((op) => op.type) : [];
        expect(types.filter((type) => type === "set_zone")).toHaveLength(4);
        expect(types.filter((type) => type === "place_asset")).toHaveLength(
            2 + 2 + 3 + 2
        );
    });

    it("are in the document as they are in the files", () => {
        const doc = readFileSync(DOC, "utf8");

        for (const file of files) {
            expect(doc, file).toContain(readExample(file).trim());
        }
    });
});
