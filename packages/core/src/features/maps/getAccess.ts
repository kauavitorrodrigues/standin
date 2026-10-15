import { ORGANIZATION_MEMBER_ROLES, USER_ROLES } from "@standin/contracts";
import type { User } from "@standin/contracts";
import { OrganizationService } from "../organizations";
import { MAP_OWNER_KINDS } from "./consts/owner";
import { findMapOwner } from "./findOwner";
import type { MapAccess } from "./types/map-access";

/**
 * Who can do what on a map, resolved from the database on every request:
 * a template map belongs to the admin, a space map to the owner of its
 * organization (and its members read it).
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
            membership: null,
        };
    }

    const membership = await OrganizationService.findMembership(
        user.id,
        owner.organizationId
    );

    return {
        mapId,
        owner,
        canRead: membership !== null,
        canEdit: membership?.role === ORGANIZATION_MEMBER_ROLES.OWNER,
        membership,
    };
};
