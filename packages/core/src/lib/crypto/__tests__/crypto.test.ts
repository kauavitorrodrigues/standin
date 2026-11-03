import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InviteLinkSecretMissingError } from "@standin/contracts";
import { openToken, readSealedToken, sealToken } from "..";

const original = process.env.INVITE_LINK_SECRET;

beforeEach(() => {
    process.env.INVITE_LINK_SECRET = "test-secret-one";
});

afterEach(() => {
    if (original === undefined) {
        delete process.env.INVITE_LINK_SECRET;
        return;
    }
    process.env.INVITE_LINK_SECRET = original;
});

describe("sealToken and openToken", () => {
    it("opens what it sealed", () => {
        const sealed = sealToken("inv_abc123");

        expect(sealed).not.toContain("inv_abc123");
        expect(openToken(sealed)).toBe("inv_abc123");
    });

    it("seals the same token to different values", () => {
        expect(sealToken("same")).not.toBe(sealToken("same"));
    });

    it("refuses a tampered body", () => {
        const [iv, tag, body] = sealToken("inv_abc123").split(".");
        const flipped = Buffer.from(body, "base64url");
        flipped[0] ^= 1;

        expect(
            openToken([iv, tag, flipped.toString("base64url")].join("."))
        ).toBeNull();
    });

    it("refuses a tampered auth tag", () => {
        const [iv, tag, body] = sealToken("inv_abc123").split(".");
        const flipped = Buffer.from(tag, "base64url");
        flipped[0] ^= 1;

        expect(
            openToken([iv, flipped.toString("base64url"), body].join("."))
        ).toBeNull();
    });

    it("refuses a value sealed with another secret", () => {
        const sealed = sealToken("inv_abc123");
        process.env.INVITE_LINK_SECRET = "test-secret-two";

        expect(openToken(sealed)).toBeNull();
    });

    it("refuses malformed values", () => {
        expect(openToken("")).toBeNull();
        expect(openToken("onlyone")).toBeNull();
        expect(openToken("two.parts")).toBeNull();
        expect(openToken("a.b.c")).toBeNull();
    });

    it("does not depend on the secret that signs sessions", () => {
        const originalJwt = process.env.JWT_SECRET;
        const sealed = sealToken("inv_abc123");

        process.env.JWT_SECRET = "another-session-secret";
        expect(openToken(sealed)).toBe("inv_abc123");

        if (originalJwt === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = originalJwt;
    });

    it("throws when the invite link secret is missing", () => {
        delete process.env.INVITE_LINK_SECRET;

        expect(() => sealToken("inv_abc123")).toThrow(
            InviteLinkSecretMissingError
        );
    });
});

describe("readSealedToken", () => {
    it("is null without a row", () => {
        expect(readSealedToken(undefined)).toBeNull();
    });

    it("is null when the column is empty", () => {
        expect(readSealedToken({ tokenEncrypted: null })).toBeNull();
    });

    it("reads the token the row kept", () => {
        expect(
            readSealedToken({ tokenEncrypted: sealToken("inv_abc123") })
        ).toBe("inv_abc123");
    });
});
