import { describe, expect, it } from "vitest";
import { WALL_IMAGE_ID } from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { STAMP_MAX_OBJECTS } from "../../consts/limits";
import type { EditorModel } from "../../types/editor-model";
import { applyEditorOp } from "../applyEditorOp";
import { captureStamp } from "../captureStamp";
import {
    buildBlankModel,
    buildMapModel,
    buildModelWithStamp,
    buildStamp,
} from "./stampTestKit";

const capture = (
    model: EditorModel,
    rect: { x: number; y: number; w: number; h: number },
    zoneLabel: string | null = null
) => captureStamp(model, rect, { zoneLabel });

const errorCodes = (result: ReturnType<typeof capture>) =>
    result.ok ? [] : result.errors.map(({ code }) => code);

const placeObject = (
    model: EditorModel,
    op: {
        tempId: string;
        assetId: string;
        tileX: number;
        tileY: number;
        parentId?: string;
    }
): EditorModel => {
    const result = applyEditorOp(model, { type: "place_asset", ...op });
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    return result.model;
};

describe("captureStamp", () => {
    it("reads tiles, objects with their offsets and the zone", () => {
        const model = buildModelWithStamp(3, 2);
        const result = capture(model, { x: 3, y: 2, w: 4, h: 4 }, "Sala");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.stamp.width).toBe(4);
        expect(result.stamp.height).toBe(4);
        expect(result.stamp.zone).toEqual({ label: "Sala" });
        expect(result.stamp.objects).toEqual(buildStamp().objects);
        expect(result.stamp.layers.ground).toEqual(new Array(16).fill(1));
        expect(result.stamp.palette[0]).toEqual(buildStamp().palette[0]);
    });

    it("leaves out layers without content and the zone when there is no label", () => {
        const result = capture(
            buildModelWithStamp(3, 2),
            { x: 3, y: 2, w: 4, h: 4 },
            null
        );

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.stamp.zone).toBeNull();
        expect(Object.keys(result.stamp.layers)).toEqual([
            "ground",
            "walls",
            "furniture",
            "foreground",
        ]);

        const floorOnly = capture(buildMapModel(), { x: 3, y: 2, w: 3, h: 3 });
        expect(floorOnly.ok && Object.keys(floorOnly.stamp.layers)).toEqual([
            "ground",
        ]);
    });

    it("does not store the wall top, which the wall writes again", () => {
        const model = buildModelWithStamp(3, 2);
        const result = capture(model, { x: 3, y: 1, w: 4, h: 5 });

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        // The top of the wall on row 2 sits on row 1 of the rectangle.
        const foreground = result.stamp.layers.foreground ?? [];
        expect(foreground.slice(0, 4)).toEqual([0, 0, 0, 0]);
        expect(
            result.stamp.palette.some(
                ({ tilesetId, tileIndex }) =>
                    tilesetId === WALL_IMAGE_ID && tileIndex === 1
            )
        ).toBe(false);
    });

    it("answers STAMP_TOO_SMALL and STAMP_TOO_LARGE for the rectangle", () => {
        const model = buildModelWithStamp();

        expect(errorCodes(capture(model, { x: 0, y: 0, w: 1, h: 4 }))).toEqual([
            Code.STAMP_TOO_SMALL,
        ]);
        expect(errorCodes(capture(model, { x: 0, y: 0, w: 41, h: 4 }))).toEqual(
            [Code.STAMP_TOO_LARGE]
        );
        expect(errorCodes(capture(model, { x: 0, y: 0, w: 4, h: 31 }))).toEqual(
            [Code.STAMP_TOO_LARGE]
        );
    });

    it("answers STAMP_OUT_OF_BOUNDS for a rectangle outside the map", () => {
        const model = buildModelWithStamp();

        expect(
            errorCodes(capture(model, { x: model.width - 1, y: 0, w: 4, h: 4 }))
        ).toEqual([Code.STAMP_OUT_OF_BOUNDS]);
        expect(errorCodes(capture(model, { x: -1, y: 0, w: 4, h: 4 }))).toEqual(
            [Code.STAMP_OUT_OF_BOUNDS]
        );
    });

    it("answers STAMP_EMPTY for a rectangle with nothing in it", () => {
        const result = capture(buildBlankModel(4, 4), {
            x: 0,
            y: 0,
            w: 4,
            h: 4,
        });

        expect(errorCodes(result)).toEqual([Code.STAMP_EMPTY]);
    });

    it("answers STAMP_TOO_MANY_OBJECTS above the limit", () => {
        let model = buildBlankModel(40, 30);
        model = {
            ...model,
            limits: { ...model.limits, objectsMax: STAMP_MAX_OBJECTS + 10 },
        };
        for (let index = 0; index <= STAMP_MAX_OBJECTS; index++) {
            model = placeObject(model, {
                tempId: `chair-${index}`,
                assetId: "chair",
                tileX: index % 40,
                tileY: Math.floor(index / 40),
            });
        }

        const result = capture(model, { x: 0, y: 0, w: 40, h: 30 });

        expect(errorCodes(result)).toEqual([Code.STAMP_TOO_MANY_OBJECTS]);
    });

    it("answers STAMP_OBJECT_CROSSES_EDGE for an object only partly inside", () => {
        const model = buildModelWithStamp(3, 2);
        // The table covers x 4 and 5 of the map. The rectangle ends at x 4.
        // The monitor on it is left without its parent as well.
        const result = capture(model, { x: 3, y: 2, w: 2, h: 4 });

        expect(errorCodes(result)).toEqual([
            Code.STAMP_OBJECT_CROSSES_EDGE,
            Code.STAMP_PARENT_OUTSIDE,
        ]);
    });

    it("answers STAMP_PARENT_OUTSIDE for a surface item whose parent stayed out", () => {
        let model = buildMapModel();
        model = placeObject(model, {
            tempId: "t",
            assetId: "table",
            tileX: 4,
            tileY: 4,
        });
        model = placeObject(model, {
            tempId: "m",
            assetId: "monitor",
            tileX: 4,
            tileY: 4,
            parentId: "t",
        });
        // Both sit on the same cell. A rectangle that holds the monitor but
        // not the table cannot exist, so the table is moved out of it.
        model = {
            ...model,
            placed: model.placed.map((item) =>
                item.id === "t" ? { ...item, tileX: 9 } : item
            ),
        };

        const result = capture(model, { x: 3, y: 3, w: 3, h: 3 });

        expect(errorCodes(result)).toEqual([Code.STAMP_PARENT_OUTSIDE]);
    });

    it("takes a ground piece whose parent stayed out, without the link", () => {
        let model = buildMapModel();
        model = placeObject(model, {
            tempId: "t",
            assetId: "table",
            tileX: 9,
            tileY: 4,
        });
        model = placeObject(model, {
            tempId: "c",
            assetId: "chair",
            tileX: 4,
            tileY: 4,
        });
        model = {
            ...model,
            placed: model.placed.map((item) =>
                item.id === "c" ? { ...item, parentId: "t" } : item
            ),
        };

        const result = capture(model, { x: 3, y: 3, w: 3, h: 3 });

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.stamp.objects).toEqual([
            expect.objectContaining({ assetId: "chair", parentIndex: null }),
        ]);
    });

    it("puts a parent before its child even when the model lists them the other way", () => {
        const model = buildModelWithStamp(3, 2);
        const reversed = { ...model, placed: [...model.placed].reverse() };

        const result = capture(reversed, { x: 3, y: 2, w: 4, h: 4 });

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const monitor = result.stamp.objects.findIndex(
            ({ assetId }) => assetId === "monitor"
        );
        const parent = result.stamp.objects[monitor].parentIndex;
        expect(parent).not.toBeNull();
        expect(parent as number).toBeLessThan(monitor);
        expect(result.stamp.objects[parent as number].assetId).toBe("table");
    });

    it("answers STAMP_ASSET_UNAVAILABLE for an object whose asset left the library", () => {
        const model = buildModelWithStamp(3, 2);
        const stripped = {
            ...model,
            library: {
                ...model.library,
                assets: model.library.assets.filter(({ id }) => id !== "chair"),
            },
        };

        const result = capture(stripped, { x: 3, y: 2, w: 4, h: 4 });

        expect(errorCodes(result)).toContain(Code.STAMP_ASSET_UNAVAILABLE);
    });

    it("answers STAMP_TILESET_UNAVAILABLE for a tileset that left the library", () => {
        const model = buildModelWithStamp(3, 2);
        const stripped = {
            ...model,
            usedTilesets: model.library.tilesets,
            library: {
                ...model.library,
                tilesets: model.library.tilesets.filter(
                    ({ id }) => id !== WALL_IMAGE_ID
                ),
            },
        };

        const result = capture(stripped, { x: 3, y: 2, w: 4, h: 4 });

        expect(errorCodes(result)).toEqual([Code.STAMP_TILESET_UNAVAILABLE]);
    });

    it("answers STAMP_INVALID for a zone label that is empty", () => {
        const result = capture(
            buildModelWithStamp(3, 2),
            { x: 3, y: 2, w: 4, h: 4 },
            "  "
        );

        expect(errorCodes(result)).toEqual([Code.STAMP_INVALID]);
    });
});
