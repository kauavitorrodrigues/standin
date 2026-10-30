import { describe, expect, it } from "vitest";
import { describePlayRefusal } from "../describePlayRefusal";

describe("describePlayRefusal", () => {
    it("says nothing about the cooldown, which is applied here too", () => {
        expect(
            describePlayRefusal({
                ok: false,
                code: "SOUNDBOARD_COOLDOWN",
                retryAfterMs: 400,
            })
        ).toBeNull();
    });

    it("says nothing about the limit of clips at once, which only disables", () => {
        expect(
            describePlayRefusal({
                ok: false,
                code: "SOUNDBOARD_TOO_MANY_CLIPS",
            })
        ).toBeNull();
    });

    it("names a person outside a space", () => {
        expect(
            describePlayRefusal({ ok: false, code: "SOUNDBOARD_NOT_IN_SPACE" })
        ).toContain("Entre");
    });

    it("falls back for an unknown code", () => {
        expect(describePlayRefusal({ ok: false, code: "X" })).toContain(
            "tocar"
        );
    });
});
