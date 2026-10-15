// Roles used by the permission matrix. ADMIN is app-wide, OWNER and MEMBER
// are resolved from the user's membership in an organization.
export const ROLES = {
    ADMIN: "ADMIN",
    OWNER: "OWNER",
    MEMBER: "MEMBER",
} as const;
