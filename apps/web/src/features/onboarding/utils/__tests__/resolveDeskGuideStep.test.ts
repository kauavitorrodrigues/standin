import { describe, expect, it } from "vitest";
import { resolveDeskGuideStep } from "../resolveDeskGuideStep";

describe("resolveDeskGuideStep", () => {
    it("points at the free desks while the person has none", () => {
        expect(
            resolveDeskGuideStep({ hasOwnDesk: false, freeDeskCount: 3 })
        ).toBe("pick");
    });

    it("says there is none when every desk is taken", () => {
        expect(
            resolveDeskGuideStep({ hasOwnDesk: false, freeDeskCount: 0 })
        ).toBe("none-free");
    });

    it("offers the walk once the person has a desk", () => {
        expect(
            resolveDeskGuideStep({ hasOwnDesk: true, freeDeskCount: 0 })
        ).toBe("walk");
    });
});
