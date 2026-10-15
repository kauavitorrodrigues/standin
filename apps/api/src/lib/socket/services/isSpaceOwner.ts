import { OrganizationService } from "@standin/core";
import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";

// The owner of a space is the OWNER of its organization, the same rule the
// maps use. Locked rooms never turn this user away.
export const isSpaceOwner = async (
    userId: string,
    organizationId: string
): Promise<boolean> => {
    const membership = await OrganizationService.findMembership(
        userId,
        organizationId
    );
    return membership?.role === ORGANIZATION_MEMBER_ROLES.OWNER;
};
