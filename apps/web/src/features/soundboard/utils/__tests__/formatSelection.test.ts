import { describe, expect, it } from "vitest";
import { formatSelection } from "../formatSelection";

describe("formatSelection", () => {
    it("shows seconds with two decimals", () => {
        expect(formatSelection(5150)).toBe("5.15s");
        expect(formatSelection(10000)).toBe("10.00s");
        expect(formatSelection(0)).toBe("0.00s");
    });
});
