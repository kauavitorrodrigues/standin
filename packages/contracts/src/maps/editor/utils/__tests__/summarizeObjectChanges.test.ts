import { describe, expect, it } from "vitest";
import type { EditorOp } from "../../schemas/editorOp.schema";
import { summarizeObjectChanges } from "../summarizeObjectChanges";

const object = (id: string, parentId: string | null = null) => ({
    id,
    assetId: "a",
    tileX: 0,
    tileY: 0,
    offsetX: 0,
    offsetY: 0,
    parentId,
    propertyOverrides: null,
});

const base = {
    placed: [
        object("d-mine"),
        object("v1", "d-mine"),
        object("v2", "d-mine"),
        object("d-other"),
        object("crate"),
    ],
    desks: [
        { mapAssetId: "d-mine", userId: "me" },
        { mapAssetId: "d-other", userId: "other" },
    ],
};
const ME = { userId: "me" };

const place = (tempId: string): EditorOp => ({
    type: "place_asset",
    tempId,
    assetId: "a",
    tileX: 0,
    tileY: 0,
});

describe("summarizeObjectChanges", () => {
    it("counts nothing for an empty draft", () => {
        expect(summarizeObjectChanges(base, [], ME)).toEqual({
            placed: 0,
            moved: 0,
            replaced: 0,
            removed: 0,
            ownDeskRemoved: false,
            ownDeskItems: 0,
        });
    });

    it("counts placed, moved, replaced and removed objects", () => {
        const ops: EditorOp[] = [
            place("n1"),
            place("n2"),
            { type: "move_asset", id: "crate", tileX: 1, tileY: 1 },
            { type: "replace_asset", id: "d-other", assetId: "a" },
            { type: "remove_asset", id: "v1" },
        ];

        expect(summarizeObjectChanges(base, ops, ME)).toMatchObject({
            placed: 2,
            moved: 1,
            replaced: 1,
            removed: 1,
            ownDeskRemoved: false,
        });
    });

    it("counts an object once however many times it moves", () => {
        const ops: EditorOp[] = [
            { type: "move_asset", id: "crate", tileX: 1, tileY: 1 },
            { type: "move_asset", id: "crate", tileX: 2, tileY: 2 },
        ];

        expect(summarizeObjectChanges(base, ops, ME).moved).toBe(1);
    });

    it("counts a moved object that is removed later only as removed", () => {
        const ops: EditorOp[] = [
            { type: "move_asset", id: "crate", tileX: 1, tileY: 1 },
            { type: "remove_asset", id: "crate" },
        ];

        expect(summarizeObjectChanges(base, ops, ME)).toMatchObject({
            moved: 0,
            removed: 1,
        });
    });

    it("counts a placed object moved or removed by the same draft as placed or nothing", () => {
        const moved: EditorOp[] = [
            place("n1"),
            { type: "move_asset", id: "n1", tileX: 4, tileY: 4 },
        ];
        const removed: EditorOp[] = [
            place("n1"),
            { type: "remove_asset", id: "n1" },
        ];

        expect(summarizeObjectChanges(base, moved, ME)).toMatchObject({
            placed: 1,
            moved: 0,
        });
        expect(summarizeObjectChanges(base, removed, ME)).toMatchObject({
            placed: 0,
            removed: 0,
        });
    });

    it("flags the own desk removal and counts the items on it", () => {
        const ops: EditorOp[] = [
            { type: "remove_asset", id: "d-mine", releaseDesk: true },
        ];

        expect(summarizeObjectChanges(base, ops, ME)).toMatchObject({
            removed: 1,
            ownDeskRemoved: true,
            ownDeskItems: 2,
        });
    });

    it("does not flag the removal of the desk of someone else", () => {
        const ops: EditorOp[] = [{ type: "remove_asset", id: "d-other" }];

        expect(summarizeObjectChanges(base, ops, ME)).toMatchObject({
            removed: 1,
            ownDeskRemoved: false,
            ownDeskItems: 0,
        });
    });

    it("ignores operations that are not about objects", () => {
        const ops: EditorOp[] = [{ type: "set_background", color: "#000000" }];

        expect(summarizeObjectChanges(base, ops, ME).placed).toBe(0);
    });
});
