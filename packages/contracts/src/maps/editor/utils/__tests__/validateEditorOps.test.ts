import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import type { EditorOp } from "../../schemas/editorOp.schema";
import { buildBlankEditorModel } from "../buildBlankEditorModel";
import { replayOps } from "../replayOps";
import { validateEditorOps } from "../validateEditorOps";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        type: "DECORATION",
        placement: "GROUND",
        footprint: { w: 1, h: 1, offsetX: 0 },
        ...overrides,
    }) as AssetDefinition;

const library = {
    tilesets: [],
    assets: [
        asset({ id: "crate" }),
        asset({
            id: "door",
            type: "DOOR",
            footprint: { w: 1, h: 2, offsetX: 0 },
        }),
    ],
    categories: [],
    areas: [],
} as unknown as LibraryPalette;

const base = buildBlankEditorModel({ width: 20, height: 20, library });

const place = (
    tempId: string,
    assetId: string,
    tileX: number,
    tileY: number
): EditorOp => ({ type: "place_asset", tempId, assetId, tileX, tileY });

const room: EditorOp = {
    type: "set_zone",
    zone: {
        kind: "private",
        key: "room",
        label: "Room",
        rect: { x: 2, y: 2, w: 8, h: 8 },
    },
};

describe("validateEditorOps", () => {
    it("answers the model of a valid draft", () => {
        const ops = [room, place("a", "door", 2, 4), place("b", "crate", 5, 5)];

        const result = validateEditorOps(base, ops);

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.model.placed.map(({ id }) => id)).toEqual(["a", "b"]);
        expect(result.model).toEqual((replayOps(base, ops) as any).model);
    });

    it("answers an empty draft as valid", () => {
        expect(validateEditorOps(base, []).ok).toBe(true);
    });

    it("points a replay failure at the op that failed", () => {
        const result = validateEditorOps(base, [
            place("a", "crate", 1, 1),
            place("b", "missing", 2, 2),
            place("c", "crate", 3, 3),
        ]);

        expect(result).toEqual({
            ok: false,
            issues: [
                expect.objectContaining({
                    opIndex: 1,
                    code: "ASSET_NOT_IN_LIBRARY",
                }),
            ],
        });
    });

    it("points a door outside every room at the last op", () => {
        const result = validateEditorOps(base, [
            place("a", "door", 15, 15),
            place("b", "crate", 1, 1),
            place("c", "crate", 3, 3),
        ]);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues).toEqual([
            expect.objectContaining({
                opIndex: 2,
                code: "DOOR_OUTSIDE_PRIVATE_ZONE",
                path: "placed.a",
            }),
        ]);
    });

    it("reports a replay failure before the door check", () => {
        const result = validateEditorOps(base, [
            place("a", "door", 15, 15),
            place("b", "missing", 1, 1),
        ]);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues[0]).toMatchObject({
            opIndex: 1,
            code: "ASSET_NOT_IN_LIBRARY",
        });
    });

    it("refuses a door left behind when its room is removed", () => {
        // The map needs a spawn, or removing the room fails on that instead.
        const withRoom = replayOps(base, [
            {
                type: "set_zone",
                zone: {
                    id: 2,
                    kind: "spawn",
                    rect: { x: 12, y: 12, w: 1, h: 1 },
                },
            },
            { ...room, zone: { ...(room as any).zone, id: 1 } },
            place("a", "door", 2, 4),
        ]);
        expect(withRoom.ok).toBe(true);
        if (!withRoom.ok) return;
        expect(validateEditorOps(withRoom.model, []).ok).toBe(true);

        const result = validateEditorOps(withRoom.model, [
            { type: "remove_zone", zoneId: 1 },
        ]);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues).toEqual([
            expect.objectContaining({
                opIndex: 0,
                code: "DOOR_OUTSIDE_PRIVATE_ZONE",
            }),
        ]);
    });
});
