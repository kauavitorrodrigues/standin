import {
    ROLES,
    USER_ROLES,
    type OrganizationMemberRole,
    type Role,
    type User,
} from "@standin/contracts";

/**
 * Collapses the app-level role and the organization membership into the
 * single role used by the permission matrix. Admins are always ADMIN.
 * Without a membership the user is treated as a plain MEMBER, so only
 * actions open to every role (such as creating an organization) pass.
 */
export function resolveRole(
    user: Pick<User, "role">,
    membershipRole?: OrganizationMemberRole | null
): Role {
    if (user.role === USER_ROLES.ADMIN) return ROLES.ADMIN;
    if (membershipRole === ROLES.OWNER) return ROLES.OWNER;
    return ROLES.MEMBER;
}
