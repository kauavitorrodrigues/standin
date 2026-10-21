import { describe, expect, it } from "vitest";
import { NAME_TAG } from "@/features/game/consts/name-tag";
import { truncateName } from "../truncateName";

describe("truncateName", () => {
    it("keeps a short name", () => {
        expect(truncateName("Ana")).toBe("Ana");
    });

    it("trims the spaces around the name", () => {
        expect(truncateName("  Ana  ")).toBe("Ana");
    });

    it("keeps a name of exactly the maximum length", () => {
        const name = "a".repeat(NAME_TAG.MAX_CHARACTERS);
        expect(truncateName(name)).toBe(name);
    });

    it("cuts a long name and ends it with the ellipsis, within the maximum", () => {
        const result = truncateName("a".repeat(40));

        expect(result.endsWith(NAME_TAG.ELLIPSIS)).toBe(true);
        expect(Array.from(result)).toHaveLength(NAME_TAG.MAX_CHARACTERS);
    });

    it("does not leave a space before the ellipsis", () => {
        const name = `${"a".repeat(NAME_TAG.MAX_CHARACTERS - 4)} bbbbbbbb`;
        expect(truncateName(name)).not.toMatch(/\s\.\.\.$/);
    });

    it("does not split a character made of two code units", () => {
        const result = truncateName("😀".repeat(30));
        expect(result).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
    });
});
