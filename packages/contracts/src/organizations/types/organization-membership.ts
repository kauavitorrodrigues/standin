import type { z } from "zod/v4";
import type {
    OrganizationMemberRoleSchema,
    OrganizationMembershipSchema,
} from "../schemas/organization-membership.schema";

export type OrganizationMemberRole = z.infer<typeof OrganizationMemberRoleSchema>;
export type OrganizationMembership = z.infer<typeof OrganizationMembershipSchema>;
