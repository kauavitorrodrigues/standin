import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    DeskAlreadyClaimedError,
    DeskNotFoundError,
    SpaceNotFoundError,
} from "@standin/contracts";
import { sealToken } from "../../../../lib/crypto";
import {
    hasKeptDesk,
    isDeskUnavailableError,
    isInvitedEmail,
    serializeInvitation,
} from "../utils";
import type { InvitationRow } from "../types";

const original = process.env.JWT_SECRET;

beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-one";
});

afterEach(() => {
    if (original === undefined) {
        delete process.env.JWT_SECRET;
        return;
    }
    process.env.JWT_SECRET = original;
});

const rowWith = (tokenEncrypted: string | null): InvitationRow => ({
    id: "inv-1",
    organizationId: "org-1",
    email: "ana@example.com",
    tokenEncrypted,
    spaceId: "space-1",
    mapAssetId: "desk-1",
    createdBy: "user-1",
    expiresAt: new Date("2026-12-01T00:00:00Z"),
    acceptedAt: null,
    createdAt: new Date("2026-11-01T00:00:00Z"),
});

describe("isInvitedEmail", () => {
    it("matches regardless of case and spaces", () => {
        expect(
            isInvitedEmail(
                { email: " Ana@Example.com " },
                { email: "ana@example.com" }
            )
        ).toBe(true);
    });

    it("refuses another e-mail or no account", () => {
        expect(
            isInvitedEmail(
                { email: "bob@example.com" },
                { email: "ana@example.com" }
            )
        ).toBe(false);
        expect(isInvitedEmail(undefined, { email: "ana@example.com" })).toBe(
            false
        );
    });
});

describe("hasKeptDesk", () => {
    it("needs both the space and the desk", () => {
        expect(hasKeptDesk({ spaceId: "s", mapAssetId: "d" })).toBe(true);
        expect(hasKeptDesk({ spaceId: "s", mapAssetId: null })).toBe(false);
        expect(hasKeptDesk({ spaceId: null, mapAssetId: "d" })).toBe(false);
        expect(hasKeptDesk({ spaceId: null, mapAssetId: null })).toBe(false);
    });
});

describe("isDeskUnavailableError", () => {
    it("is true for a desk taken, a desk gone or a space gone", () => {
        expect(isDeskUnavailableError(new DeskAlreadyClaimedError())).toBe(
            true
        );
        expect(isDeskUnavailableError(new DeskNotFoundError())).toBe(true);
        expect(isDeskUnavailableError(new SpaceNotFoundError())).toBe(true);
    });

    it("is false for anything else", () => {
        expect(isDeskUnavailableError(new Error("boom"))).toBe(false);
        expect(isDeskUnavailableError(null)).toBe(false);
    });
});

describe("serializeInvitation", () => {
    it("carries the token when it can be opened", () => {
        const result = serializeInvitation(rowWith(sealToken("inv_abc")));

        expect(result?.token).toBe("inv_abc");
        expect(result?.expiresAt).toBe("2026-12-01T00:00:00.000Z");
    });

    it("is null when the row kept no token", () => {
        expect(serializeInvitation(rowWith(null))).toBeNull();
    });

    it("is null when the token cannot be opened", () => {
        const row = rowWith(sealToken("inv_abc"));
        process.env.JWT_SECRET = "test-secret-two";

        expect(serializeInvitation(row)).toBeNull();
    });
});
