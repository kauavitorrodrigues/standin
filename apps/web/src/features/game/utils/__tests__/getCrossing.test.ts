import { describe, expect, it } from "vitest";
import { getCrossing } from "@/features/game/utils/getCrossing";

describe("getCrossing", () => {
    it("is in when entering a room", () => {
        expect(getCrossing(null, "a")).toBe("in");
    });

    it("is out when leaving a room", () => {
        expect(getCrossing("a", null)).toBe("out");
    });

    it("counts for nothing when the side does not change", () => {
        expect(getCrossing(null, null)).toBeNull();
        expect(getCrossing("a", "a")).toBeNull();
    });

    it("is in when going from a room straight into another", () => {
        expect(getCrossing("a", "b")).toBe("in");
    });
});
