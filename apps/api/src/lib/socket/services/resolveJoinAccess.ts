import {
    OrganizationService,
    SpaceGuestService,
    SpaceService,
} from "@standin/core";
import {
    ORGANIZATION_MEMBER_ROLES,
    SpaceNotFoundError,
} from "@standin/contracts";

export type JoinAccess = {
    // A member of the organization of the space: hears the requests of guests.
    isHost: boolean;
    // The OWNER of that organization. Locked rooms never turn this user away.
    isOwner: boolean;
};

/**
 * What a person may be in a space, read from the database and nothing the
 * client sent: the organization comes from the space and the person from the
 * token. A member joins, an admitted guest inside the 24h joins, anyone else
 * (a pending guest, a stranger, a space that does not exist) gets null.
 */
export const resolveJoinAccess = async (
    userId: string,
    spaceId: string
): Promise<JoinAccess | null> => {
    let organizationId: string;
    try {
        ({ organizationId } = await SpaceService.findRefById(spaceId));
    } catch (error) {
        if (error instanceof SpaceNotFoundError) return null;
        throw error;
    }

    const membership = await OrganizationService.findMembership(
        userId,
        organizationId
    );
    if (membership) {
        return {
            isHost: true,
            isOwner: membership.role === ORGANIZATION_MEMBER_ROLES.OWNER,
        };
    }

    const guest = await SpaceGuestService.findAdmitted(userId, spaceId);
    if (guest) return { isHost: false, isOwner: false };

    return null;
};
