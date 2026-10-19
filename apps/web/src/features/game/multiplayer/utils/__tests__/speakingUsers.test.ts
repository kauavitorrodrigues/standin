import { describe, expect, it } from "vitest";
import { toggleSpeakingUser } from "../speakingUsers";

describe("toggleSpeakingUser", () => {
    it("adds a user that starts speaking without touching the old set", () => {
        const before = new Set(["ana"]);

        const after = toggleSpeakingUser(before, "bia", true);

        expect([...after]).toEqual(["ana", "bia"]);
        expect([...before]).toEqual(["ana"]);
    });

    it("removes a user that stops speaking", () => {
        expect([...toggleSpeakingUser(new Set(["ana"]), "ana", false)]).toEqual(
            []
        );
    });

    it("returns the same set when nothing changes", () => {
        const before = new Set(["ana"]);

        expect(toggleSpeakingUser(before, "ana", true)).toBe(before);
        expect(toggleSpeakingUser(before, "bia", false)).toBe(before);
    });
});
