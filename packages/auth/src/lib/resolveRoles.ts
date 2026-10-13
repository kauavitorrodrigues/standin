import {
    ROLES,
    USER_ROLES,
    type OrganizationMemberRole,
    type Role,
    type User,
} from "@standin/contracts";

/**
 * The roles a user holds in a request. The application role (admin) and the
 * organization role (owner or member) are independent axes, so an admin who
 * also owns an organization holds both. Without a membership the user is a
 * plain MEMBER, which only passes actions open to every role.
 */
export function resolveRoles(
    user: Pick<User, "role">,
    membershipRole?: OrganizationMemberRole | null
): Role[] {
    const roles: Role[] = [
        membershipRole === ROLES.OWNER ? ROLES.OWNER : ROLES.MEMBER,
    ];

    if (user.role === USER_ROLES.ADMIN) roles.unshift(ROLES.ADMIN);

    return roles;
}
