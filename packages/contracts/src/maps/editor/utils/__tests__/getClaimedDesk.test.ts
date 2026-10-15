import { describe, expect, it } from "vitest";
import { getClaimedDesk } from "../getClaimedDesk";

describe("getClaimedDesk", () => {
    const model = { desks: [{ mapAssetId: "d1", userId: "u1" }] };

    it("returns the claim of a claimed desk", () => {
        expect(getClaimedDesk(model, "d1")).toEqual({
            mapAssetId: "d1",
            userId: "u1",
        });
    });

    it("returns nothing for an unclaimed object", () => {
        expect(getClaimedDesk(model, "d2")).toBeUndefined();
    });
});
