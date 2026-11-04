import { describe, expect, it } from "vitest";
import { canGetGuestLink } from "../guestInviteAccess";

describe("canGetGuestLink", () => {
    it("always offers the link to the owner", () => {
        expect(canGetGuestLink(true, false)).toBe(true);
        expect(canGetGuestLink(true, undefined)).toBe(true);
    });

    it("offers it to a member only when the space lets members invite", () => {
        expect(canGetGuestLink(false, true)).toBe(true);
        expect(canGetGuestLink(false, false)).toBe(false);
    });

    it("keeps it from a member while the setting is still loading", () => {
        expect(canGetGuestLink(false, undefined)).toBe(false);
    });
});
