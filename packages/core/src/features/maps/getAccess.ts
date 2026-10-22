import { ORGANIZATION_MEMBER_ROLES, USER_ROLES } from "@standin/contracts";
import type { OrganizationMembership, User } from "@standin/contracts";
import type { AdmittedGuest } from "../spaces/guests/types";
import { OrganizationService } from "../organizations";
import { findAdmittedSpaceGuest } from "../spaces/guests/findAdmitted";
import { MAP_OWNER_KINDS } from "./consts/owner";
import { findMapOwner } from "./findOwner";
import type { MapAccess } from "./types/map-access";

// A member needs no pass, so only a person outside the organization is looked
// up as a guest.
const findGuestPass = async (
    membership: OrganizationMembership | null,
    userId: string,
    spaceId: string
): Promise<AdmittedGuest | null> => {
    if (membership) return null;
    return findAdmittedSpaceGuest(userId, spaceId);
};

/**
 * Who can do what on a map, resolved from the database on every request:
 * a template map belongs to the admin, a space map to the owner of its
 * organization (and its members read it). A guest of the space only views:
 * `canRead` stays the members' door, so a route nobody thought of for guests
 * stays closed to them.
 */
export const getMapAccess = async (
    user: Pick<User, "id" | "role">,
    mapId: string
): Promise<MapAccess> => {
    const owner = await findMapOwner(mapId);
    const isAdmin = user.role === USER_ROLES.ADMIN;

    if (owner.kind === MAP_OWNER_KINDS.TEMPLATE) {
        return {
            mapId,
            owner,
            canRead: isAdmin,
            canEdit: isAdmin,
            canDecorate: false,
            membership: null,
            guest: null,
            canView: isAdmin,
        };
    }

    const membership = await OrganizationService.findMembership(
        user.id,
        owner.organizationId
    );
    const guest = await findGuestPass(membership, user.id, owner.spaceId);

    return {
        mapId,
        owner,
        canRead: membership !== null,
        canEdit: membership?.role === ORGANIZATION_MEMBER_ROLES.OWNER,
        canDecorate: membership !== null,
        membership,
        guest,
        canView: membership !== null || guest !== null,
    };
};
