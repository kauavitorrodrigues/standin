import { describe, expect, it } from "vitest";
import { applyUnreadCount } from "../applyUnreadCount";

describe("applyUnreadCount", () => {
    it("replaces the conversation count and sums the total", () => {
        const data = { counts: { a: 2, b: 1 }, total: 3 };
        expect(applyUnreadCount(data, "a", 3)).toEqual({
            counts: { a: 3, b: 1 },
            total: 4,
        });
    });

    it("rebuilds the total from the counts even when the cached total drifted", () => {
        const data = { counts: { a: 2, b: 1 }, total: 99 };
        expect(applyUnreadCount(data, "a", 3)?.total).toBe(4);
    });

    it("adds a conversation that had no count", () => {
        expect(applyUnreadCount({ counts: {}, total: 0 }, "a", 1)).toEqual({
            counts: { a: 1 },
            total: 1,
        });
    });

    it("leaves an empty cache alone", () => {
        expect(applyUnreadCount(undefined, "a", 1)).toBeUndefined();
    });
});
