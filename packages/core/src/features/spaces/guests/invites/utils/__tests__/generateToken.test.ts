import { describe, expect, it } from "vitest";
import { generateInviteToken, hashInviteToken } from "../generateToken";

describe("generateInviteToken", () => {
    it("is 32 bytes in base64url, safe for a URL", () => {
        const token = generateInviteToken();

        expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it("never repeats", () => {
        const tokens = new Set(
            Array.from({ length: 200 }, () => generateInviteToken())
        );

        expect(tokens.size).toBe(200);
    });
});

describe("hashInviteToken", () => {
    it("gives the same 64 hex characters for the same token", () => {
        const token = generateInviteToken();

        expect(hashInviteToken(token)).toMatch(/^[0-9a-f]{64}$/);
        expect(hashInviteToken(token)).toBe(hashInviteToken(token));
    });

    it("gives another hash for another token", () => {
        expect(hashInviteToken("a")).not.toBe(hashInviteToken("b"));
    });

    it("does not contain the token", () => {
        const token = generateInviteToken();

        expect(hashInviteToken(token)).not.toContain(token);
    });

    it("matches the known SHA-256 of a value", () => {
        expect(hashInviteToken("abc")).toBe(
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    });
});
