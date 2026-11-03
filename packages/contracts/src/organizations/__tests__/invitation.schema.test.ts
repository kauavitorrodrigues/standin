import { describe, expect, it } from "vitest";
import {
    MAX_INVITATIONS_PER_REQUEST,
    OrganizationInvitationCreateSchema,
    isOrganizationInvitationToken,
} from "../schemas/organization-invitation.schema";

describe("isOrganizationInvitationToken", () => {
    it("knows an e-mail invitation by its prefix", () => {
        expect(isOrganizationInvitationToken("inv_abc")).toBe(true);
        expect(isOrganizationInvitationToken("abc")).toBe(false);
        expect(isOrganizationInvitationToken("")).toBe(false);
    });
});

describe("OrganizationInvitationCreateSchema", () => {
    it("lower cases the e-mails and defaults the desk to none", () => {
        const result = OrganizationInvitationCreateSchema.safeParse({
            emails: ["Ana@Example.COM"],
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
            emails: ["ana@example.com"],
            spaceId: null,
            mapAssetId: null,
        });
    });

    it("refuses an invalid e-mail", () => {
        expect(
            OrganizationInvitationCreateSchema.safeParse({ emails: ["nope"] })
                .success
        ).toBe(false);
    });

    it("refuses an empty list", () => {
        expect(
            OrganizationInvitationCreateSchema.safeParse({ emails: [] }).success
        ).toBe(false);
    });

    it("refuses more than the limit and accepts the limit", () => {
        const make = (count: number) =>
            Array.from({ length: count }, (_, i) => `p${i}@example.com`);

        expect(
            OrganizationInvitationCreateSchema.safeParse({
                emails: make(MAX_INVITATIONS_PER_REQUEST),
            }).success
        ).toBe(true);
        expect(
            OrganizationInvitationCreateSchema.safeParse({
                emails: make(MAX_INVITATIONS_PER_REQUEST + 1),
            }).success
        ).toBe(false);
    });

    it("refuses a desk without a space", () => {
        expect(
            OrganizationInvitationCreateSchema.safeParse({
                emails: ["a@example.com"],
                mapAssetId: "desk-1",
            }).success
        ).toBe(false);
    });

    it("accepts a desk with its space", () => {
        expect(
            OrganizationInvitationCreateSchema.safeParse({
                emails: ["a@example.com"],
                spaceId: "space-1",
                mapAssetId: "desk-1",
            }).success
        ).toBe(true);
    });
});
