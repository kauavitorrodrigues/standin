import { describe, expect, it } from "vitest";
import {
    DEFAULT_INVITE_LINK_EXPIRES_IN_HOURS,
    InviteLinkExhaustedError,
    InviteLinkExpiredError,
    InviteLinkNotFoundError,
    InviteLinkRevokedError,
    GuestAccessDisabledError,
    MAX_INVITE_LINK_USES,
    SpaceGuestAccessSchema,
    SpaceInviteLinkCreateSchema,
    SpaceJoinSchema,
} from "../../../index";

describe("SpaceInviteLinkCreateSchema", () => {
    it("falls back to a week and unlimited uses", () => {
        const data = SpaceInviteLinkCreateSchema.parse({});

        expect(data.expiresInHours).toBe(DEFAULT_INVITE_LINK_EXPIRES_IN_HOURS);
        expect(data.maxUses).toBeNull();
    });

    it("accepts a custom expiration and a use limit", () => {
        const data = SpaceInviteLinkCreateSchema.parse({
            expiresInHours: 2,
            maxUses: 5,
        });

        expect(data).toEqual({ expiresInHours: 2, maxUses: 5 });
    });

    it.each([
        { expiresInHours: 0 },
        { expiresInHours: 1.5 },
        { expiresInHours: 24 * 365 },
        { maxUses: 0 },
        { maxUses: MAX_INVITE_LINK_USES + 1 },
        { maxUses: 2.5 },
    ])("refuses %o", (input) => {
        expect(SpaceInviteLinkCreateSchema.safeParse(input).success).toBe(
            false
        );
    });
});

describe("SpaceGuestAccessSchema", () => {
    it("accepts the two modes only", () => {
        expect(
            SpaceGuestAccessSchema.safeParse({ guestAccess: "ALLOWED" }).success
        ).toBe(true);
        expect(
            SpaceGuestAccessSchema.safeParse({ guestAccess: "DISABLED" })
                .success
        ).toBe(true);
        expect(
            SpaceGuestAccessSchema.safeParse({ guestAccess: "MEETING_ONLY" })
                .success
        ).toBe(false);
    });
});

describe("SpaceJoinSchema", () => {
    it("carries only the space and drops what a client could forge", () => {
        const data = SpaceJoinSchema.parse({
            spaceId: "space-1",
            userId: "someone-else",
            organizationId: "org-9",
        });

        expect(data).toEqual({ spaceId: "space-1" });
    });

    it("refuses an empty space", () => {
        expect(SpaceJoinSchema.safeParse({ spaceId: "" }).success).toBe(false);
    });
});

describe("invite errors", () => {
    it.each([
        [new InviteLinkNotFoundError(), 404, "INVITE_LINK_NOT_FOUND"],
        [new InviteLinkExpiredError(), 410, "INVITE_LINK_EXPIRED"],
        [new InviteLinkRevokedError(), 410, "INVITE_LINK_REVOKED"],
        [new InviteLinkExhaustedError(), 410, "INVITE_LINK_EXHAUSTED"],
        [new GuestAccessDisabledError(), 403, "GUEST_ACCESS_DISABLED"],
    ])("%s has its own status and code", (error, status, code) => {
        expect(error.status).toBe(status);
        expect(error.code).toBe(code);
    });
});
