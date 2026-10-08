import { describe, expect, it } from "vitest";
import { getInitial } from "../getInitial";

describe("getInitial", () => {
    it("uppercases the first letter", () => {
        expect(getInitial("ana")).toBe("A");
    });

    it("ignores leading whitespace", () => {
        expect(getInitial("  bruno silva")).toBe("B");
    });

    it("keeps accented letters", () => {
        expect(getInitial("élida")).toBe("É");
    });

    it("keeps an emoji whole", () => {
        expect(getInitial("🙂 Zé")).toBe("🙂");
    });

    it("falls back when there is no name", () => {
        expect(getInitial("   ")).toBe("?");
    });
});
