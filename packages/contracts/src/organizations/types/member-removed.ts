// Why a person is no longer a member: the owner removed them, or they left.
export type OrganizationMemberRemovalReason = "removed" | "left";

// This person stopped being a member of an organization. Only they hear it
// (all their tabs and devices), right before the server closes their sockets
// in its spaces.
export type OrganizationMemberRemovedPayload = {
    organizationId: string;
    organizationName: string;
    reason: OrganizationMemberRemovalReason;
};
