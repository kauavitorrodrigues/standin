import { describe, expect, it } from "vitest";
import {
    InviteLinkExhaustedError,
    InviteLinkExpiredError,
    InviteLinkRevokedError,
} from "@standin/contracts";
import { assertLinkUsable } from "../assertLinkUsable";

const now = new Date("2026-10-22T12:00:00Z");
const later = new Date(now.getTime() + 60_000);
const earlier = new Date(now.getTime() - 60_000);

const link = (overrides = {}) => ({
    expiresAt: later,
    revokedAt: null,
    maxUses: null,
    usesCount: 0,
    ...overrides,
});

describe("assertLinkUsable", () => {
    it("lets a live link through", () => {
        expect(() => assertLinkUsable(link(), now)).not.toThrow();
    });

    it("lets a link with uses left through", () => {
        expect(() =>
            assertLinkUsable(link({ maxUses: 3, usesCount: 2 }), now)
        ).not.toThrow();
    });

    it("refuses an expired link, at the exact end too", () => {
        expect(() =>
            assertLinkUsable(link({ expiresAt: earlier }), now)
        ).toThrow(InviteLinkExpiredError);
        expect(() => assertLinkUsable(link({ expiresAt: now }), now)).toThrow(
            InviteLinkExpiredError
        );
    });

    it("refuses a revoked link", () => {
        expect(() =>
            assertLinkUsable(link({ revokedAt: earlier }), now)
        ).toThrow(InviteLinkRevokedError);
    });

    it("refuses a link with no uses left", () => {
        expect(() =>
            assertLinkUsable(link({ maxUses: 2, usesCount: 2 }), now)
        ).toThrow(InviteLinkExhaustedError);
    });

    it("names the revocation before the expiry", () => {
        expect(() =>
            assertLinkUsable(
                link({ revokedAt: earlier, expiresAt: earlier }),
                now
            )
        ).toThrow(InviteLinkRevokedError);
    });
});
