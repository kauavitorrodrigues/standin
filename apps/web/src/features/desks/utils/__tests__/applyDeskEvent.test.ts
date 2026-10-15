import { describe, expect, it } from "vitest";
import { applyDeskEvent } from "../applyDeskEvent";

describe("applyDeskEvent", () => {
    it("adds a claimed desk", () => {
        expect(
            applyDeskEvent([], {
                type: "claimed",
                payload: { mapAssetId: "d1", userId: "u1" },
            })
        ).toEqual([{ mapAssetId: "d1", userId: "u1" }]);
    });

    it("drops the previous desk of the person on a claim", () => {
        expect(
            applyDeskEvent([{ mapAssetId: "d1", userId: "u1" }], {
                type: "claimed",
                payload: { mapAssetId: "d2", userId: "u1" },
            })
        ).toEqual([{ mapAssetId: "d2", userId: "u1" }]);
    });

    it("removes a released desk", () => {
        expect(
            applyDeskEvent(
                [
                    { mapAssetId: "d1", userId: "u1" },
                    { mapAssetId: "d2", userId: "u2" },
                ],
                {
                    type: "released",
                    payload: { mapAssetId: "d1", userId: "u1" },
                }
            )
        ).toEqual([{ mapAssetId: "d2", userId: "u2" }]);
    });
});
