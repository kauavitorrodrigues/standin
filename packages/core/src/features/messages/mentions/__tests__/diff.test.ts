import { describe, expect, it } from "vitest";
import { diffMentions } from "../diff";

describe("diffMentions", () => {
    it("adds only the people the edit brings in", () => {
        expect(diffMentions(["a"], ["a", "b"])).toEqual({
            added: ["b"],
            removed: [],
        });
    });

    it("keeps a mention that is still there", () => {
        expect(diffMentions(["a", "b"], ["a", "b"])).toEqual({
            added: [],
            removed: [],
        });
    });

    it("removes the people the edit takes out", () => {
        expect(diffMentions(["a", "b"], ["b"])).toEqual({
            added: [],
            removed: ["a"],
        });
    });

    it("starts from nothing", () => {
        expect(diffMentions([], ["a"])).toEqual({ added: ["a"], removed: [] });
    });
});
