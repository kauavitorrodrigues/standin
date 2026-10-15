import { describe, expect, it } from "vitest";
import { applyOp } from "../applyOp";
import { applyOps } from "../applyOps";
import { StaleLayoutVersionError } from "../../errors/layout";
import { LAYOUT_ISSUE_CODES as Code } from "../issues";
import { generateBlankLayout } from "../generateBlankLayout";
import type { MapLayout } from "../../schemas/layout.schema";
import {
    FLOOR_IMAGE_ID,
    PRIVATE_IMAGE_ID,
    WALL_IMAGE_ID,
    buildLayout,
    defaults,
    library,
} from "./fixtures";

const layer = (layout: MapLayout, name: string) => {
    const found = layout.layers.find((item) => item.name === name);
    if (!found || found.type !== "tilelayer") throw new Error("no layer");
    return found;
};

const at = (layout: MapLayout, name: string, x: number, y: number) =>
    layer(layout, name).data[y * layout.width + x];

describe("applyOp", () => {
    it("paints a floor tile and keeps the input untouched", () => {
        const layout = buildLayout();
        const { layout: next, errors } = applyOp(
            layout,
            {
                type: "paint",
                layer: "ground",
                tilesetId: FLOOR_IMAGE_ID,
                tileIndex: 1,
                cells: [
                    [3, 3],
                    [4, 3],
                ],
            },
            library
        );

        expect(errors).toEqual([]);
        expect(at(next, "ground", 3, 3)).toBe(2);
        expect(at(next, "ground", 4, 3)).toBe(2);
        expect(at(layout, "ground", 3, 3)).toBe(1);
    });

    it("appends a new tileset after the last one", () => {
        const layout = generateBlankLayout("XS", { floor: defaults.floor });
        const { layout: next, errors } = applyOp(
            layout,
            {
                type: "paint",
                layer: "furniture",
                tilesetId: WALL_IMAGE_ID,
                tileIndex: 2,
                cells: [[5, 5]],
            },
            library
        );

        expect(errors).toEqual([]);
        expect(next.tilesets).toEqual([
            { name: FLOOR_IMAGE_ID, firstgid: 1 },
            { name: WALL_IMAGE_ID, firstgid: 5 },
        ]);
        expect(at(next, "furniture", 5, 5)).toBe(7);
    });

    it("writes the wall top on the row above, and erasing the wall removes it", () => {
        const painted = applyOp(
            buildLayout(),
            {
                type: "paint",
                layer: "walls",
                tilesetId: WALL_IMAGE_ID,
                tileIndex: 0,
                cells: [[6, 6]],
            },
            library
        ).layout;

        expect(at(painted, "walls", 6, 6)).toBe(5);
        expect(at(painted, "foreground", 6, 5)).toBe(6);

        const erased = applyOp(
            painted,
            { type: "erase", layer: "walls", cells: [[6, 6]] },
            library
        ).layout;

        expect(at(erased, "walls", 6, 6)).toBe(0);
        expect(at(erased, "foreground", 6, 5)).toBe(0);
    });

    it.each([
        [
            "CELL_OUT_OF_BOUNDS",
            Code.CELL_OUT_OF_BOUNDS,
            { type: "erase", layer: "ground", cells: [[99, 0]] },
        ],
        [
            "TILE_NOT_IN_LIBRARY (unknown tileset)",
            Code.TILE_NOT_IN_LIBRARY,
            {
                type: "paint",
                layer: "ground",
                tilesetId: "nope",
                tileIndex: 0,
                cells: [[1, 1]],
            },
        ],
        [
            "TILE_NOT_IN_LIBRARY (tile without meta)",
            Code.TILE_NOT_IN_LIBRARY,
            {
                type: "paint",
                layer: "ground",
                tilesetId: FLOOR_IMAGE_ID,
                tileIndex: 3,
                cells: [[1, 1]],
            },
        ],
        [
            "CATEGORY_LAYER_MISMATCH",
            Code.CATEGORY_LAYER_MISMATCH,
            {
                type: "paint",
                layer: "walls",
                tilesetId: FLOOR_IMAGE_ID,
                tileIndex: 0,
                cells: [[1, 1]],
            },
        ],
        [
            "CATEGORY_LAYER_MISMATCH (empty tile has no layer)",
            Code.CATEGORY_LAYER_MISMATCH,
            {
                type: "paint",
                layer: "ground",
                tilesetId: FLOOR_IMAGE_ID,
                tileIndex: 2,
                cells: [[1, 1]],
            },
        ],
    ] as const)("rejects %s", (_name, code, op) => {
        const layout = buildLayout();
        const result = applyOp(layout, op as never, library);

        expect(result.errors.map((issue) => issue.code)).toEqual([code]);
        expect(result.layout).toBe(layout);
    });

    it("hides tilesets that are not in the library of the map owner", () => {
        const restricted = {
            tilesets: { ...library.tilesets },
        };
        delete restricted.tilesets[PRIVATE_IMAGE_ID];

        const result = applyOp(
            buildLayout(),
            {
                type: "paint",
                layer: "ground",
                tilesetId: PRIVATE_IMAGE_ID,
                tileIndex: 0,
                cells: [[1, 1]],
            },
            restricted
        );

        expect(result.errors[0].code).toBe(Code.TILE_NOT_IN_LIBRARY);
    });

    it("sets the background and rejects a bad color at the schema level", () => {
        const { layout } = applyOp(
            buildLayout(),
            { type: "set_background", color: "#112233" },
            library
        );

        expect(layout.backgroundcolor).toBe("#112233");
    });

    it("sets and removes a zone, and refuses to remove the last spawn", () => {
        const withZone = applyOp(
            buildLayout(),
            {
                type: "set_zone",
                zone: {
                    kind: "area",
                    label: "Sala",
                    x: 0,
                    y: 0,
                    width: 64,
                    height: 64,
                },
            },
            library
        );
        expect(withZone.errors).toEqual([]);
        expect(withZone.layout.nextobjectid).toBe(3);

        const removed = applyOp(
            withZone.layout,
            { type: "remove_zone", zoneId: 2 },
            library
        );
        expect(removed.errors).toEqual([]);

        const noSpawn = applyOp(
            buildLayout(),
            { type: "remove_zone", zoneId: 1 },
            library
        );
        expect(noSpawn.errors[0].code).toBe(Code.SPAWN_MISSING);
    });

    it("rejects an invalid zone", () => {
        const result = applyOp(
            buildLayout(),
            {
                type: "set_zone",
                zone: { kind: "area", x: 0, y: 0, width: 32, height: 32 },
            },
            library
        );

        expect(result.errors[0].code).toBe(Code.ZONE_LABEL_REQUIRED);
    });
});

describe("applyOps", () => {
    it("applies a batch in order and reports the failing op index", () => {
        const layout = buildLayout();
        const result = applyOps(
            layout,
            [
                { type: "set_background", color: "#000000" },
                { type: "erase", layer: "ground", cells: [[500, 500]] },
            ],
            library
        );

        expect(result.layout).toBe(layout);
        expect(result.errors[0].path.startsWith("ops.1.")).toBe(true);
    });
});

describe("StaleLayoutVersionError", () => {
    it("is a 409 carrying the current version", () => {
        const error = new StaleLayoutVersionError(13);

        expect(error.status).toBe(409);
        expect(error.code).toBe(Code.STALE_LAYOUT_VERSION);
        expect(error.currentVersion).toBe(13);
    });
});
