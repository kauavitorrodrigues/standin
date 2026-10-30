import { describe, expect, it } from "vitest";
import { GlobalSettingsUpdateSchema } from "../schemas/global-settings.update.schema";
import { OrganizationInviteLinkCreateSchema } from "../schemas/organization-invite-link.create.schema";

describe("GlobalSettingsUpdateSchema", () => {
    it("takes one or more switches", () => {
        expect(
            GlobalSettingsUpdateSchema.safeParse({ allowSignup: false }).success
        ).toBe(true);
    });

    it("refuses an empty body, an unknown key and a non boolean", () => {
        expect(GlobalSettingsUpdateSchema.safeParse({}).success).toBe(false);
        expect(
            GlobalSettingsUpdateSchema.safeParse({ other: true }).success
        ).toBe(false);
        expect(
            GlobalSettingsUpdateSchema.safeParse({ allowSignup: "no" }).success
        ).toBe(false);
    });
});

describe("OrganizationInviteLinkCreateSchema", () => {
    it("defaults to a member link without a use limit", () => {
        const parsed = OrganizationInviteLinkCreateSchema.parse({});
        expect(parsed.role).toBe("MEMBER");
        expect(parsed.maxUses).toBeNull();
        expect(parsed.expiresInHours).toBeGreaterThan(0);
    });

    it("refuses any role other than member", () => {
        expect(
            OrganizationInviteLinkCreateSchema.safeParse({ role: "OWNER" })
                .success
        ).toBe(false);
        expect(
            OrganizationInviteLinkCreateSchema.safeParse({ role: "ADMIN" })
                .success
        ).toBe(false);
    });
});
