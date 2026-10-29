import { describe, expect, it } from "vitest";
import {
    AUTHORING_ISSUE_CODES,
    AUTHORING_ISSUE_MESSAGES,
    createIssue,
} from "../issues";

describe("authoring issue messages", () => {
    it("has a message for every code", () => {
        const codes = new Set(Object.values(AUTHORING_ISSUE_CODES));

        expect(new Set(Object.keys(AUTHORING_ISSUE_MESSAGES))).toEqual(codes);
        for (const code of codes) {
            expect(typeof AUTHORING_ISSUE_MESSAGES[code]).toBe("function");
        }
    });
});

describe("createIssue", () => {
    it("builds the issue with the params in the message", () => {
        expect(
            createIssue(AUTHORING_ISSUE_CODES.UNKNOWN_KEY, "library.assets.x", {
                kind: "asset",
                ref: "x",
            })
        ).toEqual({
            code: "AUTHORING_UNKNOWN_KEY",
            path: "library.assets.x",
            message: 'No asset has the key "x".',
        });
    });

    it("words a tileset and an asset differently", () => {
        const tileset = createIssue(AUTHORING_ISSUE_CODES.DUPLICATE_KEY, "p", {
            kind: "tileset",
            ref: "brick",
        });
        const asset = createIssue(AUTHORING_ISSUE_CODES.DUPLICATE_KEY, "p", {
            kind: "asset",
            ref: "brick",
        });

        expect(tileset.message).toContain("tileset is named");
        expect(asset.message).toContain("asset has the key");
    });

    it("fills the room, style, type and size params", () => {
        expect(
            createIssue(AUTHORING_ISSUE_CODES.ROOM_NOT_FOUND, "p", {
                room: "a",
            }).message
        ).toContain('"a"');
        expect(
            createIssue(AUTHORING_ISSUE_CODES.WALL_STYLE_NOT_FOUND, "p", {
                style: "Brick",
            }).message
        ).toContain('"Brick"');
        expect(
            createIssue(AUTHORING_ISSUE_CODES.WRONG_ASSET_TYPE, "p", {
                key: "crate",
                expected: "DOOR",
            }).message
        ).toBe('The asset "crate" is not of type DOOR.');
        expect(
            createIssue(AUTHORING_ISSUE_CODES.CELL_OUT_OF_BOUNDS, "room", {
                area: "room",
                width: 30,
                height: 20,
            }).message
        ).toContain("30 x 20");
    });

    it("picks the door and mask messages by reason and field", () => {
        const noVariant = createIssue(AUTHORING_ISSUE_CODES.DOOR_NO_SLOT, "p", {
            reason: "NO_VARIANT",
        });
        const noGap = createIssue(AUTHORING_ISSUE_CODES.DOOR_NO_SLOT, "p", {
            reason: "NO_GAP",
        });
        const mask = createIssue(AUTHORING_ISSUE_CODES.INVALID_MASK, "p", {
            field: "mask",
        });
        const solid = createIssue(AUTHORING_ISSUE_CODES.INVALID_MASK, "p", {
            field: "solidMask",
        });

        expect(noVariant.message).not.toBe(noGap.message);
        expect(mask.message).not.toBe(solid.message);
    });

    it("keeps the layout codes the server uses", () => {
        expect(AUTHORING_ISSUE_CODES.CELL_OUT_OF_BOUNDS).toBe(
            "CELL_OUT_OF_BOUNDS"
        );
        expect(AUTHORING_ISSUE_CODES.WALL_STYLE_INCOMPLETE).toBe(
            "WALL_STYLE_INCOMPLETE"
        );
    });
});
