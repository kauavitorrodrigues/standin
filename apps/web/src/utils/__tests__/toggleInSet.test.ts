import { describe, expect, it } from "vitest";
import { toggleInSet } from "../toggleInSet";

describe("toggleInSet", () => {
    it("adds what is missing", () => {
        expect([...toggleInSet(new Set(["a"]), "b")]).toEqual(["a", "b"]);
    });

    it("removes what is there", () => {
        expect([...toggleInSet(new Set(["a", "b"]), "a")]).toEqual(["b"]);
    });

    it("leaves the original alone", () => {
        const original = new Set(["a"]);

        toggleInSet(original, "b");

        expect([...original]).toEqual(["a"]);
    });
});
