import { describe, expect, it } from "vitest";
import { replayOps, validateEditorOps } from "@standin/contracts";
import type { EditorOp } from "@standin/contracts";
import { validateOps } from "../validate/validateOps";
import { ROOM, buildModel } from "./kit";

// Drafts written by hand, so the checks do not depend on the builders.
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
        key: "office",
        label: "Office",
        rect: { x: 4, y: 4, w: 10, h: 8 },
    },
};

const drafts: Record<string, EditorOp[]> = {
    "an empty draft": [],
    "a valid draft": [
        room,
        place("a", "door-n", 8, 4),
        place("b", "crate", 8, 8),
    ],
    "an unknown asset": [place("a", "missing", 1, 1)],
    "a cell outside the map": [place("a", "crate", 99, 1)],
    "overlapping objects": [
        place("a", "crate", 1, 1),
        place("b", "crate", 1, 1),
    ],
    "a taken id": [place("a", "crate", 1, 1), place("a", "crate", 2, 2)],
    "a door outside every room": [
        room,
        place("a", "door-n", 20, 15),
        place("b", "crate", 1, 1),
    ],
    "a duplicated room key": [room, room],
    "a failure after a door problem": [
        place("a", "door-n", 20, 15),
        place("b", "missing", 1, 1),
    ],
};

describe("validateOps parity with the server check", () => {
    for (const [name, ops] of Object.entries(drafts)) {
        it(`answers what validateEditorOps answers for ${name}`, () => {
            const model = buildModel();

            expect(validateOps(model, ops)).toEqual(
                validateEditorOps(model, ops)
            );
        });
    }

    it("has drafts that pass and drafts that fail", () => {
        const model = buildModel();
        const outcomes = Object.values(drafts).map(
            (ops) => validateOps(model, ops).ok
        );

        expect(outcomes).toContain(true);
        expect(outcomes).toContain(false);
    });

    it("answers the replayed model of a valid draft", () => {
        const model = buildModel();
        const ops = drafts["a valid draft"] as EditorOp[];

        const result = validateOps(model, ops);
        const replayed = replayOps(model, ops);

        expect(result.ok && replayed.ok && result.model).toEqual(
            replayed.ok && replayed.model
        );
        expect(ROOM.key).toBe("office");
    });

    it("does not change the base model", () => {
        const model = buildModel();
        const before = structuredClone(model);

        validateOps(model, drafts["a valid draft"] as EditorOp[]);

        expect(model).toEqual(before);
    });
});
