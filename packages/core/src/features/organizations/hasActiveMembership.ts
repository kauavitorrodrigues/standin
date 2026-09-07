import { findOrganizationMembership } from "./findMembership";

export const hasActiveOrganizationMembership = async (
    userId: string,
    organizationId: string
): Promise<boolean> => {
    const membership = await findOrganizationMembership(userId, organizationId);
    return membership !== null;
};
