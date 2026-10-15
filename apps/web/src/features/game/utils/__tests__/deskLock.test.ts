import { describe, expect, it } from "vitest";
import type { EditorModel, EditorOp } from "@standin/contracts";
import { createDeskVeto } from "@/features/game/utils/createDeskVeto";
import { findOtherDeskClaim } from "@/features/game/utils/findOtherDeskClaim";

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

// d-mine: my desk with a vase. d-other: the desk of Ana with a vase. d-free:
// nobody's desk. crate: a plain floor object.
const model = {
    mapId: "m",
    width: 20,
    height: 20,
    version: 1,
    layout: {},
    limits: { objectsUsed: 7, objectsMax: 100 },
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
        { mapAssetId: "d-other", userId: "ana" },
    ],
    placed: [
        object("d-mine", "desk"),
        object("v-mine", "vase", "d-mine"),
        object("d-other", "desk"),
        object("v-other", "vase", "d-other"),
        object("d-free", "desk"),
        object("crate-1", "crate"),
    ],
} as unknown as EditorModel;

const names = new Map([["ana", "Ana"]]);
const veto = createDeskVeto({
    userId: "me",
    getUserName: (id) => names.get(id) ?? null,
});

const move = (id: string): EditorOp => ({
    type: "move_asset",
    id,
    tileX: 4,
    tileY: 4,
    offsetX: 0,
    offsetY: 0,
});

describe("findOtherDeskClaim", () => {
    it("finds the claim of someone else on the desk and on what is on it", () => {
        expect(findOtherDeskClaim(model, "d-other", "me")?.userId).toBe("ana");
        expect(findOtherDeskClaim(model, "v-other", "me")?.userId).toBe("ana");
    });

    it("finds nothing for the own desk, a free desk or a plain object", () => {
        expect(findOtherDeskClaim(model, "d-mine", "me")).toBeNull();
        expect(findOtherDeskClaim(model, "v-mine", "me")).toBeNull();
        expect(findOtherDeskClaim(model, "d-free", "me")).toBeNull();
        expect(findOtherDeskClaim(model, "crate-1", "me")).toBeNull();
        expect(findOtherDeskClaim(model, null, "me")).toBeNull();
    });
});

describe("createDeskVeto", () => {
    it("refuses to move, replace or remove the desk of someone else and what is on it", () => {
        const refused = "Mesa de Ana";

        expect(veto([move("d-other")], model)).toBe(refused);
        expect(veto([move("v-other")], model)).toBe(refused);
        expect(
            veto(
                [{ type: "replace_asset", id: "d-other", assetId: "desk" }],
                model
            )
        ).toBe(refused);
        expect(veto([{ type: "remove_asset", id: "v-other" }], model)).toBe(
            refused
        );
    });

    it("refuses to place an item on the desk of someone else", () => {
        const op: EditorOp = {
            type: "place_asset",
            tempId: "t1",
            assetId: "vase",
            tileX: 1,
            tileY: 1,
            parentId: "d-other",
        };

        expect(veto([op], model)).toBe("Mesa de Ana");
    });

    it("names an owner that is not known by the fallback", () => {
        const anonymous = createDeskVeto({
            userId: "me",
            getUserName: () => null,
        });

        expect(anonymous([move("d-other")], model)).toBe(
            "Mesa de outra pessoa"
        );
    });

    it("lets the own desk, a free desk and plain objects be changed", () => {
        expect(veto([move("d-mine")], model)).toBeNull();
        expect(veto([move("v-mine")], model)).toBeNull();
        expect(veto([move("d-free")], model)).toBeNull();
        expect(veto([move("crate-1")], model)).toBeNull();
        expect(
            veto(
                [{ type: "remove_asset", id: "d-mine", releaseDesk: true }],
                model
            )
        ).toBeNull();
    });
});
