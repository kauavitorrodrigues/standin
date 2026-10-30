import { describe, expect, it } from "vitest";
import { canManageClip } from "../canManageClip";

const viewer = {
    userId: "u-1",
    isPlatformAdmin: false,
    isOrganizationOwner: false,
};
const orgClip = { organizationId: "org-1", createdById: "u-2" };
const defaultClip = { organizationId: null, createdById: "u-2" };

describe("canManageClip", () => {
    it("lets the owner of the organization manage its clips", () => {
        expect(
            canManageClip(orgClip, { ...viewer, isOrganizationOwner: true })
        ).toBe(true);
    });

    it("lets the uploader manage their own clip", () => {
        expect(canManageClip(orgClip, { ...viewer, userId: "u-2" })).toBe(true);
    });

    it("keeps a regular member away from a clip of someone else", () => {
        expect(canManageClip(orgClip, viewer)).toBe(false);
    });

    it("gives the platform admin no implicit access to an organization", () => {
        expect(
            canManageClip(orgClip, { ...viewer, isPlatformAdmin: true })
        ).toBe(false);
    });

    it("leaves default clips to the platform admin only", () => {
        expect(
            canManageClip(defaultClip, { ...viewer, isPlatformAdmin: true })
        ).toBe(true);
        expect(
            canManageClip(defaultClip, { ...viewer, isOrganizationOwner: true })
        ).toBe(false);
        expect(canManageClip(defaultClip, { ...viewer, userId: "u-2" })).toBe(
            false
        );
    });
});
