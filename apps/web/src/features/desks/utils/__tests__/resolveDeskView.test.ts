import { describe, expect, it } from "vitest";
import { resolveDeskView } from "../resolveDeskView";

describe("resolveDeskView", () => {
    it("offers a claim on a free desk when the person has none", () => {
        expect(
            resolveDeskView({
                status: { kind: "free" },
                ownUserId: "me",
                hasOwnDesk: false,
            })
        ).toEqual({ kind: "free", action: "claim" });
    });

    it("offers a move on a free desk when the person has another", () => {
        expect(
            resolveDeskView({
                status: { kind: "free" },
                ownUserId: "me",
                hasOwnDesk: true,
            })
        ).toEqual({ kind: "free", action: "move" });
    });

    it("shows the person as the owner of their own desk", () => {
        expect(
            resolveDeskView({
                status: { kind: "mine" },
                ownUserId: "me",
                hasOwnDesk: true,
            })
        ).toEqual({ kind: "owned", ownerId: "me", isSelf: true });
    });

    it("shows the owner of the desk of someone else", () => {
        expect(
            resolveDeskView({
                status: { kind: "taken", ownerId: "ana" },
                ownUserId: "me",
                hasOwnDesk: false,
            })
        ).toEqual({ kind: "owned", ownerId: "ana", isSelf: false });
    });
});
