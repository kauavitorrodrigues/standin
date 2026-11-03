import { describe, expect, it } from "vitest";
import {
    InviteLinkExhaustedError,
    InviteLinkExpiredError,
    InviteLinkNotFoundError,
    InviteLinkRevokedError,
    GuestAccessDisabledError,
    SpaceGuestAccessSchema,
    SpaceJoinSchema,
} from "../../../index";

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
