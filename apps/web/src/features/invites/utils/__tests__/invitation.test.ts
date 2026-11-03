import { describe, expect, it } from "vitest";
import { canSendInvitations, resolveDeskInput } from "../invitation";

const desk = { spaceId: "s1", mapAssetId: "d1" };

describe("resolveDeskInput", () => {
    it("sends the desk when it was asked for and picked", () => {
        expect(resolveDeskInput(true, desk)).toEqual(desk);
    });

    it("sends none when the desk is not asked for", () => {
        expect(resolveDeskInput(false, desk)).toEqual({
            spaceId: null,
            mapAssetId: null,
        });
    });

    it("sends none when nothing was picked", () => {
        expect(resolveDeskInput(true, null)).toEqual({
            spaceId: null,
            mapAssetId: null,
        });
    });
});

describe("canSendInvitations", () => {
    it("needs at least one e-mail", () => {
        expect(
            canSendInvitations({
                emailCount: 0,
                isDeskRequested: false,
                desk: null,
            })
        ).toBe(false);
        expect(
            canSendInvitations({
                emailCount: 1,
                isDeskRequested: false,
                desk: null,
            })
        ).toBe(true);
    });

    it("needs a desk when one was asked for", () => {
        expect(
            canSendInvitations({
                emailCount: 1,
                isDeskRequested: true,
                desk: null,
            })
        ).toBe(false);
        expect(
            canSendInvitations({ emailCount: 1, isDeskRequested: true, desk })
        ).toBe(true);
    });
});
