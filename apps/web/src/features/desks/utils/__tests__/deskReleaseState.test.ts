import { describe, expect, it } from "vitest";
import type { Desk } from "../../types/desk";
import { applyDeskEvent } from "../applyDeskEvent";
import { resolveDeskStatus } from "../resolveDeskStatus";
import { resolveDeskView } from "../resolveDeskView";

const ME = "me";
const desks: Desk[] = [
    { mapAssetId: "d-mine", userId: ME },
    { mapAssetId: "d-ana", userId: "ana" },
];

// What the page reads after someone decorates away the own desk: the server
// frees the claim, and desk_released of the room reaches useSpaceDesks.
describe("the desks after the own desk is decorated away", () => {
    const after = applyDeskEvent(desks, {
        type: "released",
        payload: { mapAssetId: "d-mine", userId: ME },
    });

    it("leaves the person without a desk and keeps the others", () => {
        expect(after).toEqual([{ mapAssetId: "d-ana", userId: "ana" }]);
        expect(after.some((desk) => desk.userId === ME)).toBe(false);
    });

    it("offers to claim a free desk instead of moving to it", () => {
        const view = resolveDeskView({
            status: resolveDeskStatus(after, "d-free", ME),
            ownUserId: ME,
            hasOwnDesk: after.some((desk) => desk.userId === ME),
        });

        expect(view).toEqual({ kind: "free", action: "claim" });
    });

    it("tells the removed desk is no longer the person's", () => {
        expect(resolveDeskStatus(after, "d-mine", ME)).toEqual({
            kind: "free",
        });
    });
});
