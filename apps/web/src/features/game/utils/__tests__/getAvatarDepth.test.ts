import { describe, expect, it } from "vitest";
import { getAvatarDepth } from "../getAvatarDepth";
import { getDepthAt } from "../buildPlacedSlices";

const base = { radius: 8, mapHeightPx: 640, isSitting: false };

describe("getAvatarDepth", () => {
    it("draws under an object whose base is below the feet", () => {
        const treeBase = 320;
        const behind = getAvatarDepth({ ...base, centerY: 250 });
        expect(behind).toBeLessThan(getDepthAt(treeBase, base.mapHeightPx));
    });

    it("draws over an object whose base is above the feet", () => {
        const treeBase = 320;
        const inFront = getAvatarDepth({ ...base, centerY: 360 });
        expect(inFront).toBeGreaterThan(getDepthAt(treeBase, base.mapHeightPx));
    });

    it("draws a seated avatar over everything", () => {
        expect(
            getAvatarDepth({ ...base, centerY: 0, isSitting: true })
        ).toBeGreaterThan(getAvatarDepth({ ...base, centerY: 640 }));
    });
});
