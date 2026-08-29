import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";
import type { OrganizationMembership } from "@standin/contracts";

export const isOrganizationOwner = (
    membership: OrganizationMembership,
): boolean => membership.role === ORGANIZATION_MEMBER_ROLES.OWNER;
