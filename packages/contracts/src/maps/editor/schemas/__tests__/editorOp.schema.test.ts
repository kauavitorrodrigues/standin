import { describe, expect, it } from "vitest";
import { MAX_CELLS_PER_OP, MAX_PUBLISH_OPS } from "../../consts/limits";
import { EditorOpSchema } from "../editorOp.schema";
import { PublishRequestSchema } from "../publish.schema";

const ok = (op: unknown) => EditorOpSchema.safeParse(op).success;
const cells = (n: number) => Array.from({ length: n }, (_, i) => [i, 0]);
const uuid = "123e4567-e89b-42d3-a456-426614174000";

describe("EditorOpSchema", () => {
    it("accepts and rejects paint", () => {
        const base = {
            type: "paint",
            layer: "ground",
            tilesetId: "t",
            tileIndex: 0,
            cells: [[1, 2]],
        };
        expect(ok(base)).toBe(true);
        expect(ok({ ...base, tileIndex: -1 })).toBe(false);
    });

    it("accepts and rejects paint_tiles", () => {
        const base = {
            type: "paint_tiles",
            layer: "ground",
            tiles: [
                { tilesetId: "t", tileIndex: 0, cells: [[1, 2]] },
                { tilesetId: "t", tileIndex: 1, cells: [[3, 2]] },
            ],
        };
        expect(ok(base)).toBe(true);
        expect(ok({ ...base, tiles: [] })).toBe(false);
        expect(ok({ ...base, layer: "nope" })).toBe(false);
        expect(
            ok({ ...base, tiles: [{ tilesetId: "", tileIndex: 0, cells: [] }] })
        ).toBe(false);
    });

    it("limits the total cells of paint_tiles, not each item", () => {
        const item = (n: number, tileIndex: number) => ({
            tilesetId: "t",
            tileIndex,
            cells: cells(n),
        });
        const op = (tiles: unknown[]) => ({
            type: "paint_tiles",
            layer: "ground",
            tiles,
        });
        const half = MAX_CELLS_PER_OP / 2;

        expect(ok(op([item(half, 0), item(half, 1)]))).toBe(true);
        expect(ok(op([item(half, 0), item(half + 1, 1)]))).toBe(false);
    });

    it("accepts and rejects erase", () => {
        expect(ok({ type: "erase", layer: "walls", cells: [[0, 0]] })).toBe(
            true
        );
        expect(ok({ type: "erase", layer: "nope", cells: [[0, 0]] })).toBe(
            false
        );
    });

    it("rejects cells above the per-op limit", () => {
        const paint = {
            type: "paint",
            layer: "ground",
            tilesetId: "t",
            tileIndex: 0,
        };
        expect(ok({ ...paint, cells: cells(MAX_CELLS_PER_OP) })).toBe(true);
        expect(ok({ ...paint, cells: cells(MAX_CELLS_PER_OP + 1) })).toBe(
            false
        );
        expect(
            ok({
                type: "erase",
                layer: "ground",
                cells: cells(MAX_CELLS_PER_OP + 1),
            })
        ).toBe(false);
    });

    it("accepts and rejects set_zone", () => {
        const spawn = {
            type: "set_zone",
            zone: { kind: "spawn", rect: { x: 0, y: 0, w: 1, h: 1 } },
        };
        expect(ok(spawn)).toBe(true);
        expect(
            ok({
                type: "set_zone",
                zone: { kind: "door", rect: { x: 0, y: 0, w: 1, h: 1 } },
            })
        ).toBe(false);
    });

    it("requires a label on area zones", () => {
        const zone = { kind: "area", rect: { x: 0, y: 0, w: 3, h: 3 } };
        expect(ok({ type: "set_zone", zone })).toBe(false);
        expect(ok({ type: "set_zone", zone: { ...zone, label: "  " } })).toBe(
            false
        );
        expect(ok({ type: "set_zone", zone: { ...zone, label: "Sala" } })).toBe(
            true
        );
    });

    it("rejects area zones smaller than the minimum", () => {
        const zone = {
            kind: "area",
            label: "Sala",
            rect: { x: 0, y: 0, w: 1, h: 3 },
        };
        expect(ok({ type: "set_zone", zone })).toBe(false);
    });

    it("requires a label and a key on room zones", () => {
        const zone = {
            kind: "private",
            label: "Sala",
            key: "room-a",
            rect: { x: 0, y: 0, w: 3, h: 3 },
        };
        expect(ok({ type: "set_zone", zone })).toBe(true);
        expect(
            ok({ type: "set_zone", zone: { ...zone, key: undefined } })
        ).toBe(false);
        expect(ok({ type: "set_zone", zone: { ...zone, key: " " } })).toBe(
            false
        );
        expect(ok({ type: "set_zone", zone: { ...zone, label: " " } })).toBe(
            false
        );
        expect(
            ok({
                type: "set_zone",
                zone: { ...zone, rect: { ...zone.rect, w: 1 } },
            })
        ).toBe(false);
    });

    it("refuses a key on a zone that is not a room", () => {
        const zone = {
            kind: "area",
            label: "Sala",
            key: "k",
            rect: { x: 0, y: 0, w: 3, h: 3 },
        };
        expect(ok({ type: "set_zone", zone })).toBe(false);
    });

    it("accepts and rejects remove_zone and set_background", () => {
        expect(ok({ type: "remove_zone", zoneId: 4 })).toBe(true);
        expect(ok({ type: "remove_zone", zoneId: "4" })).toBe(false);
        expect(ok({ type: "set_background", color: "#aabbcc" })).toBe(true);
        expect(ok({ type: "set_background", color: "red" })).toBe(false);
    });

    it("accepts and rejects place_asset", () => {
        const op = {
            type: "place_asset",
            tempId: "tmp",
            assetId: "a",
            tileX: 1,
            tileY: 2,
        };
        expect(ok(op)).toBe(true);
        expect(ok({ ...op, parentId: null })).toBe(true);
        expect(ok({ ...op, tileX: 1.5 })).toBe(false);
        expect(ok({ ...op, tempId: "" })).toBe(false);
    });

    it("accepts and rejects move_asset", () => {
        const op = {
            type: "move_asset",
            id: "x",
            tileX: 1,
            tileY: 2,
            parentId: "p",
        };
        expect(ok(op)).toBe(true);
        expect(ok({ ...op, id: undefined })).toBe(false);
    });

    it("accepts and rejects replace_asset", () => {
        expect(ok({ type: "replace_asset", id: "x", assetId: "a" })).toBe(true);
        expect(ok({ type: "replace_asset", id: "x" })).toBe(false);
    });

    it("accepts and rejects remove_asset", () => {
        expect(ok({ type: "remove_asset", id: "x", releaseDesk: true })).toBe(
            true
        );
        expect(ok({ type: "remove_asset", id: "x", releaseDesk: "yes" })).toBe(
            false
        );
    });

    it("rejects unknown types", () => {
        expect(ok({ type: "teleport" })).toBe(false);
    });
});

describe("PublishRequestSchema", () => {
    const op = { type: "remove_zone", zoneId: 1 };

    it("accepts a valid request", () => {
        const result = PublishRequestSchema.safeParse({
            publishId: uuid,
            baseVersion: 1,
            ops: [op],
        });
        expect(result.success).toBe(true);
    });

    it("accepts paint_tiles inside a publish request", () => {
        const paintTiles = {
            type: "paint_tiles",
            layer: "ground",
            tiles: [{ tilesetId: "t", tileIndex: 0, cells: [[1, 2]] }],
        };
        const request = { publishId: uuid, baseVersion: 1 };

        expect(
            PublishRequestSchema.safeParse({ ...request, ops: [paintTiles] })
                .success
        ).toBe(true);
        expect(
            PublishRequestSchema.safeParse({
                ...request,
                ops: [{ ...paintTiles, tiles: [] }],
            }).success
        ).toBe(false);
    });

    it("rejects a publishId that is not a uuid", () => {
        const result = PublishRequestSchema.safeParse({
            publishId: "abc",
            baseVersion: 1,
            ops: [],
        });
        expect(result.success).toBe(false);
    });

    it("rejects a base version below 1", () => {
        const result = PublishRequestSchema.safeParse({
            publishId: uuid,
            baseVersion: 0,
            ops: [],
        });
        expect(result.success).toBe(false);
    });

    it("rejects more ops than MAX_PUBLISH_OPS", () => {
        const ops = Array.from({ length: MAX_PUBLISH_OPS + 1 }, () => op);
        expect(
            PublishRequestSchema.safeParse({
                publishId: uuid,
                baseVersion: 1,
                ops,
            }).success
        ).toBe(false);
        expect(
            PublishRequestSchema.safeParse({
                publishId: uuid,
                baseVersion: 1,
                ops: ops.slice(1),
            }).success
        ).toBe(true);
    });
});

describe("PublishRequestSchema scopes", () => {
    const op = { type: "remove_zone", zoneId: 1 };
    const revision = "2026-10-14T12:00:00.000Z";

    it("treats a missing scope as map", () => {
        const result = PublishRequestSchema.safeParse({
            publishId: uuid,
            baseVersion: 1,
            ops: [op],
        });

        expect(result.success).toBe(true);
        expect(result.data?.scope).toBe("map");
    });

    it("accepts the map scope with a base version", () => {
        expect(
            PublishRequestSchema.safeParse({
                scope: "map",
                publishId: uuid,
                baseVersion: 3,
                ops: [],
            }).success
        ).toBe(true);
    });

    it("accepts the objects scope with a base objects revision", () => {
        const result = PublishRequestSchema.safeParse({
            scope: "objects",
            publishId: uuid,
            baseObjectsRevision: revision,
            ops: [],
        });

        expect(result.success).toBe(true);
    });

    it("accepts a null revision for a map that had no object", () => {
        expect(
            PublishRequestSchema.safeParse({
                scope: "objects",
                publishId: uuid,
                baseObjectsRevision: null,
                ops: [],
            }).success
        ).toBe(true);
    });

    it("rejects the objects scope without a revision", () => {
        expect(
            PublishRequestSchema.safeParse({
                scope: "objects",
                publishId: uuid,
                ops: [],
            }).success
        ).toBe(false);
    });

    it("rejects the objects scope with a base version instead", () => {
        expect(
            PublishRequestSchema.safeParse({
                scope: "objects",
                publishId: uuid,
                baseVersion: 1,
                ops: [],
            }).success
        ).toBe(false);
    });

    it("rejects a revision that is not an ISO date", () => {
        expect(
            PublishRequestSchema.safeParse({
                scope: "objects",
                publishId: uuid,
                baseObjectsRevision: "yesterday",
                ops: [],
            }).success
        ).toBe(false);
    });

    it("rejects the map scope with a revision only", () => {
        expect(
            PublishRequestSchema.safeParse({
                scope: "map",
                publishId: uuid,
                baseObjectsRevision: revision,
                ops: [],
            }).success
        ).toBe(false);
    });

    it("rejects an unknown scope", () => {
        expect(
            PublishRequestSchema.safeParse({
                scope: "zones",
                publishId: uuid,
                baseVersion: 1,
                ops: [],
            }).success
        ).toBe(false);
    });
});
