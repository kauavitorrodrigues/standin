import { describe, expect, it } from "vitest";
import { CursorClaims, getCursorClaims } from "../CursorClaims";

describe("CursorClaims", () => {
    it("is the pointer while anyone claims it", () => {
        const claims = new CursorClaims();

        expect(claims.claim("desk", true)).toBe(true);
        expect(claims.claim("remote", true)).toBe(true);
        expect(claims.claim("desk", false)).toBe(true);
        expect(claims.claim("remote", false)).toBe(false);
    });

    it("keeps the pointer when one controller lets go and another claimed it in the same frame", () => {
        const claims = new CursorClaims();
        claims.claim("remote", true);

        // The mouse goes from a remote avatar to the own avatar.
        claims.claim("own", true);
        const isPointer = claims.claim("remote", false);

        expect(isPointer).toBe(true);
    });

    it("is the arrow with no claim", () => {
        expect(new CursorClaims().claim("desk", false)).toBe(false);
    });

    it("counts a claimant once", () => {
        const claims = new CursorClaims();
        claims.claim("desk", true);
        claims.claim("desk", true);

        expect(claims.claim("desk", false)).toBe(false);
    });

    it("gives the same claims for the same canvas and others for another", () => {
        const a = {};
        const b = {};

        expect(getCursorClaims(a)).toBe(getCursorClaims(a));
        expect(getCursorClaims(a)).not.toBe(getCursorClaims(b));
    });
});
