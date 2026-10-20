import { describe, expect, it } from "vitest";
import { AVATAR_ADMIN_PATHS, AVATAR_NEW_KINDS } from "../../consts/avatarNew";
import { avatarNewSearchSchema } from "../../schemas/avatarNewSearch";
import { getNewKindListPath } from "../admin/getNewKindListPath";

describe("avatarNewSearchSchema", () => {
    it("accepts no search, which is the type step", () => {
        expect(avatarNewSearchSchema.parse({})).toEqual({});
    });

    it("keeps a known kind and the part of a color", () => {
        expect(
            avatarNewSearchSchema.parse({ kind: "color", partId: "p1" })
        ).toEqual({ kind: "color", partId: "p1" });
    });

    it("drops a kind it does not know instead of failing", () => {
        expect(avatarNewSearchSchema.parse({ kind: "hat" })).toEqual({});
    });

    it("drops an empty part id", () => {
        expect(avatarNewSearchSchema.parse({ partId: "" })).toEqual({});
    });
});

describe("getNewKindListPath", () => {
    it("sends parts and colors to the parts list", () => {
        expect(getNewKindListPath(AVATAR_NEW_KINDS.PART)).toBe(
            AVATAR_ADMIN_PATHS.PARTS
        );
        expect(getNewKindListPath(AVATAR_NEW_KINDS.COLOR)).toBe(
            AVATAR_ADMIN_PATHS.PARTS
        );
    });

    it("sends bases and mannequins to the bases list", () => {
        expect(getNewKindListPath(AVATAR_NEW_KINDS.BASE)).toBe(
            AVATAR_ADMIN_PATHS.BASES
        );
        expect(getNewKindListPath(AVATAR_NEW_KINDS.MANNEQUIN)).toBe(
            AVATAR_ADMIN_PATHS.BASES
        );
    });
});
