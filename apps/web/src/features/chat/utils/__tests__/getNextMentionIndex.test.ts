import { describe, expect, it } from "vitest";
import { getNextMentionIndex } from "../getNextMentionIndex";

describe("getNextMentionIndex", () => {
    it("moves down and wraps to the first", () => {
        expect(getNextMentionIndex("ArrowDown", 0, 3)).toBe(1);
        expect(getNextMentionIndex("ArrowDown", 2, 3)).toBe(0);
    });

    it("moves up and wraps to the last", () => {
        expect(getNextMentionIndex("ArrowUp", 1, 3)).toBe(0);
        expect(getNextMentionIndex("ArrowUp", 0, 3)).toBe(2);
    });

    it("leaves other keys and an empty list alone", () => {
        expect(getNextMentionIndex("a", 0, 3)).toBeNull();
        expect(getNextMentionIndex("ArrowDown", 0, 0)).toBeNull();
    });
});
