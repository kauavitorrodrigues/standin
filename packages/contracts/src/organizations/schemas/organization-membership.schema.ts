import { z } from "zod/v4";
import { ORGANIZATION_MEMBER_ROLES } from "../enums/organization-member-role";

export const OrganizationMemberRoleSchema = z.enum(ORGANIZATION_MEMBER_ROLES);

export const OrganizationMembershipSchema = z.object({
    id: z.string(),
    userId: z.string(),
    organizationId: z.string(),
    role: OrganizationMemberRoleSchema,
});
