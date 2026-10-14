import { describe, expect, it } from "vitest";
import { formatAreaSize } from "../formatAreaSize";
import { formatObjectCount } from "../formatObjectCount";
import { formatUpdatedAt } from "../formatUpdatedAt";

describe("area formats", () => {
    it("writes the size as width x height", () => {
        expect(formatAreaSize(12, 8)).toBe("12 x 8");
    });

    it("pluralizes the objects", () => {
        expect(formatObjectCount(1)).toBe("1 objeto");
        expect(formatObjectCount(0)).toBe("0 objetos");
        expect(formatObjectCount(3)).toBe("3 objetos");
    });

    it("writes the day in pt-BR", () => {
        expect(formatUpdatedAt(new Date(2026, 9, 14, 12).getTime())).toBe(
            "14 out 2026"
        );
    });
});
