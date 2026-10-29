import { describe, expect, it } from "vitest";
import { generateToken } from "../generateToken";
import { getTokenPrefix } from "../getTokenPrefix";
import { hashToken } from "../hashToken";
import { isServiceToken } from "../isServiceToken";

describe("generateToken", () => {
    it("starts with sit_ and is long and url safe", () => {
        const token = generateToken();

        expect(token.startsWith("sit_")).toBe(true);
        expect(token.slice(4)).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it("never repeats", () => {
        expect(generateToken()).not.toBe(generateToken());
    });
});

describe("hashToken", () => {
    it("is a stable sha-256 hex that hides the token", () => {
        const hash = hashToken("sit_abc");

        expect(hash).toBe(hashToken("sit_abc"));
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
        expect(hash).not.toContain("abc");
        expect(hashToken("sit_abd")).not.toBe(hash);
    });
});

describe("getTokenPrefix", () => {
    it("keeps the first 12 characters", () => {
        expect(getTokenPrefix("sit_0123456789abcdef")).toBe("sit_01234567");
    });
});

describe("isServiceToken", () => {
    it("tells a service token from a jwt", () => {
        expect(isServiceToken("sit_abc")).toBe(true);
        expect(isServiceToken("eyJhbGciOi.payload.sig")).toBe(false);
    });
});
