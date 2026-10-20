import { describe, expect, it } from "vitest";
import { AVATAR_PART_VALIDATION_MESSAGES as Messages } from "../../consts/messages";
import { getColorPairIssues } from "../admin/getColorPairIssues";

describe("getColorPairIssues", () => {
    it("accepts an empty pair when the color is optional", () => {
        expect(
            getColorPairIssues({ colorKey: "", colorHex: "" }, false)
        ).toEqual({});
    });

    it("asks for both fields when the color is required", () => {
        expect(
            getColorPairIssues({ colorKey: "", colorHex: "" }, true)
        ).toEqual({
            colorKey: Messages.COLOR_KEY_REQUIRED,
            colorHex: Messages.COLOR_HEX_REQUIRED,
        });
    });

    it("asks for the field that is missing", () => {
        expect(
            getColorPairIssues({ colorKey: "Azul", colorHex: "" }, false)
        ).toEqual({ colorHex: Messages.COLOR_HEX_REQUIRED });
        expect(
            getColorPairIssues({ colorKey: "  ", colorHex: "#2DBDFF" }, false)
        ).toEqual({ colorKey: Messages.COLOR_KEY_REQUIRED });
    });

    it("accepts a hex in lower case, which is sent in upper case", () => {
        expect(
            getColorPairIssues(
                { colorKey: "Azul", colorHex: " #2dbdff " },
                true
            )
        ).toEqual({});
    });

    it("refuses a hex that is not #RRGGBB", () => {
        expect(
            getColorPairIssues({ colorKey: "Azul", colorHex: "#FFF" }, true)
        ).toEqual({ colorHex: Messages.COLOR_HEX_INVALID });
    });

    it("refuses a color name that is too long", () => {
        expect(
            getColorPairIssues(
                { colorKey: "x".repeat(33), colorHex: "#2DBDFF" },
                true
            )
        ).toEqual({ colorKey: Messages.COLOR_KEY_TOO_LONG });
    });
});
