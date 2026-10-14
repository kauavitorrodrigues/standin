import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "../../../consts/constants";
import { WALL_IMAGE_ID } from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { applyEditorOp } from "../applyEditorOp";
import { canPlaceStamp } from "../canPlaceStamp";
import { buildMapModel, buildStamp } from "./stampTestKit";

// The tile the map spawn sits on.
const spawnTile = (model: ReturnType<typeof buildMapModel>) => {
    const spawn = findZonesGroup(model.layout)!.objects[0];
    return { x: spawn.x / TILE_SIZE, y: spawn.y / TILE_SIZE };
};

// A corner for the 4 x 4 stamp that leaves the spawn out.
const farFromSpawn = (model: ReturnType<typeof buildMapModel>) => {
    const spawn = spawnTile(model);
    return spawn.x < model.width / 2
        ? { x: model.width - 4, y: 0 }
        : { x: 0, y: 0 };
};

const place = (
    model: ReturnType<typeof buildMapModel>,
    tileX: number,
    tileY: number
) => {
    const result = applyEditorOp(model, {
        type: "place_asset",
        tempId: "blocker",
        assetId: "chair",
        tileX,
        tileY,
    });
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    return result.model;
};

describe("canPlaceStamp", () => {
    it("accepts a free spot", () => {
        const model = buildMapModel();
        const { x, y } = farFromSpawn(model);

        expect(canPlaceStamp(model, buildStamp(), x, y)).toEqual({ ok: true });
    });

    it("answers STAMP_OUT_OF_BOUNDS when the rectangle does not fit", () => {
        const model = buildMapModel();
        const stamp = buildStamp();

        for (const [x, y] of [
            [-1, 0],
            [0, -1],
            [model.width - 3, 0],
            [0, model.height - 3],
            [0.5, 0],
        ]) {
            expect(canPlaceStamp(model, stamp, x, y)).toEqual({
                ok: false,
                reason: Code.STAMP_OUT_OF_BOUNDS,
            });
        }
    });

    it("answers STAMP_AREA_NOT_EMPTY for an object inside the rectangle", () => {
        const model = place(buildMapModel(), 1, 1);

        expect(canPlaceStamp(model, buildStamp(), 0, 0)).toEqual({
            ok: false,
            reason: Code.STAMP_AREA_NOT_EMPTY,
        });
    });

    it("counts the whole footprint of an object that starts outside", () => {
        const model = buildMapModel();
        const stamp = buildStamp();
        // A table 2 wide anchored left of the rectangle reaches into it.
        const withTable = applyEditorOp(model, {
            type: "place_asset",
            tempId: "t",
            assetId: "table",
            tileX: 0,
            tileY: 1,
        });
        if (!withTable.ok) throw new Error("table");

        expect(canPlaceStamp(withTable.model, stamp, 1, 0).ok).toBe(false);
        expect(canPlaceStamp(withTable.model, stamp, 2, 0).ok).toBe(true);
    });

    it("lets an object outside the rectangle be", () => {
        const model = place(buildMapModel(), 5, 5);

        expect(canPlaceStamp(model, buildStamp(), 0, 0)).toEqual({ ok: true });
    });

    it("replaces tiles and accepts area zones in the way", () => {
        const model = buildMapModel();
        const zoned = applyEditorOp(model, {
            type: "set_zone",
            zone: {
                kind: "area",
                rect: { x: 0, y: 0, w: 3, h: 3 },
                label: "Other",
            },
        });
        if (!zoned.ok) throw new Error("zone");

        expect(canPlaceStamp(zoned.model, buildStamp(), 0, 0)).toEqual({
            ok: true,
        });
    });

    it("answers STAMP_COVERS_SPAWN when the rectangle holds the spawn", () => {
        const model = buildMapModel();
        const spawn = spawnTile(model);

        expect(
            canPlaceStamp(model, buildStamp(), spawn.x - 1, spawn.y - 1)
        ).toEqual({
            ok: false,
            reason: Code.STAMP_COVERS_SPAWN,
        });
    });

    it("answers TOO_MANY_OBJECTS when the objects do not fit under the limit", () => {
        const model = buildMapModel();
        const { x, y } = farFromSpawn(model);
        const stamp = buildStamp();
        const full = {
            ...model,
            limits: {
                objectsUsed: 97,
                objectsMax: 100,
            },
        };

        expect(canPlaceStamp(full, stamp, x, y)).toEqual({
            ok: false,
            reason: Code.TOO_MANY_OBJECTS,
        });
        expect(
            canPlaceStamp(
                { ...full, limits: { objectsUsed: 96, objectsMax: 100 } },
                stamp,
                x,
                y
            ).ok
        ).toBe(true);
    });

    it("answers STAMP_TILESET_UNAVAILABLE when the map library lacks a tileset", () => {
        const model = buildMapModel();
        const { x, y } = farFromSpawn(model);
        const stripped = {
            ...model,
            library: {
                ...model.library,
                tilesets: model.library.tilesets.filter(
                    ({ id }) => id !== WALL_IMAGE_ID
                ),
            },
        };

        expect(canPlaceStamp(stripped, buildStamp(), x, y)).toEqual({
            ok: false,
            reason: Code.STAMP_TILESET_UNAVAILABLE,
        });
    });

    it("answers STAMP_ASSET_UNAVAILABLE when the map library lacks an asset", () => {
        const model = buildMapModel();
        const { x, y } = farFromSpawn(model);
        const stripped = {
            ...model,
            library: {
                ...model.library,
                assets: model.library.assets.filter(
                    ({ id }) => id !== "poster"
                ),
            },
        };

        expect(canPlaceStamp(stripped, buildStamp(), x, y)).toEqual({
            ok: false,
            reason: Code.STAMP_ASSET_UNAVAILABLE,
        });
    });
});
