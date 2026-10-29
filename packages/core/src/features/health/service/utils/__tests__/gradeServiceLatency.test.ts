import { describe, expect, it } from "vitest";
import { gradeServiceLatency } from "../gradeServiceLatency";

describe("gradeServiceLatency", () => {
    it("is ok up to the limit", () => {
        expect(gradeServiceLatency(0)).toBe("ok");
        expect(gradeServiceLatency(500)).toBe("ok");
    });

    it("is degraded above the limit", () => {
        expect(gradeServiceLatency(501)).toBe("degraded");
    });
});
