// The people or the invitations of an organization changed (someone joined, an
// invitation was made, cancelled or taken). Its owners read their lists again.
export type OrganizationMembersChangedPayload = {
    organizationId: string;
};
