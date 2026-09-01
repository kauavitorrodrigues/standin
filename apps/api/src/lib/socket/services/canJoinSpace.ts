import { OrganizationService, SpaceService } from "@standin/core";
import { SpaceNotFoundError } from "@standin/contracts";

export const canJoinSpace = async (
    userId: string,
    organizationId: string,
    spaceId: string
): Promise<boolean> => {
    const membership = await OrganizationService.findMembership(
        userId,
        organizationId
    );
    if (!membership) return false;

    try {
        await SpaceService.findById(organizationId, spaceId);
        return true;
    } catch (error) {
        if (error instanceof SpaceNotFoundError) return false;
        throw error;
    }
};
