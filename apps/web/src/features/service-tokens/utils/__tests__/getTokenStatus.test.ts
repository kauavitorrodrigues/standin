import { describe, expect, it } from "vitest";
import { getTokenStatus } from "../getTokenStatus";

const NOW = new Date("2026-10-30T12:00:00.000Z");

describe("getTokenStatus", () => {
    it("is active without expiry or revocation", () => {
        expect(getTokenStatus({ expiresAt: null, revokedAt: null }, NOW)).toBe(
            "active"
        );
    });

    it("is active before the expiry", () => {
        const expiresAt = new Date("2026-11-01T00:00:00.000Z");
        expect(getTokenStatus({ expiresAt, revokedAt: null }, NOW)).toBe(
            "active"
        );
    });

    it("is expired at and after the expiry", () => {
        expect(
            getTokenStatus({ expiresAt: new Date(NOW), revokedAt: null }, NOW)
        ).toBe("expired");
        const past = new Date("2026-10-01T00:00:00.000Z");
        expect(getTokenStatus({ expiresAt: past, revokedAt: null }, NOW)).toBe(
            "expired"
        );
    });

    it("is revoked even when it also expired", () => {
        const past = new Date("2026-10-01T00:00:00.000Z");
        expect(getTokenStatus({ expiresAt: past, revokedAt: past }, NOW)).toBe(
            "revoked"
        );
    });

    it("reads the dates the API sends as strings", () => {
        const expiresAt = "2026-10-01T00:00:00.000Z" as unknown as Date;
        expect(getTokenStatus({ expiresAt, revokedAt: null }, NOW)).toBe(
            "expired"
        );
    });
});
