import {
    ORGANIZATION_MEMBER_ROLES,
    SPACE_VIEWER_KINDS,
    SpaceNotFoundError,
} from "@standin/contracts";
import type { OrganizationMembership, SpaceView } from "@standin/contracts";
import { db, spacesTable, and, eq, isNull } from "@standin/database";
import { ConversationService } from "../conversations";
import { MapService } from "../maps";
import { findOrganizationMembership } from "../organizations/findMembership";
import { findAdmittedSpaceGuest } from "./guests/findAdmitted";

type Viewer = SpaceView["viewer"];

// A member is a member of the organization of the space. A guest is a person
// outside of it with a live pass. Anyone else sees no space at all.
const resolveViewer = async (
    membership: OrganizationMembership | null,
    userId: string,
    spaceId: string
): Promise<Viewer> => {
    if (membership) {
        return {
            kind: SPACE_VIEWER_KINDS.MEMBER,
            isOwner: membership.role === ORGANIZATION_MEMBER_ROLES.OWNER,
        };
    }

    const guest = await findAdmittedSpaceGuest(userId, spaceId);
    if (!guest) throw new SpaceNotFoundError();
    return { kind: SPACE_VIEWER_KINDS.GUEST, isOwner: false };
};

// The conversation belongs to the organization, so only a member has one.
const findConversationId = async (
    viewer: Viewer,
    spaceId: string
): Promise<string | null> => {
    if (viewer.kind === SPACE_VIEWER_KINDS.GUEST) return null;

    const conversation = await ConversationService.findBySpaceId(spaceId);
    return conversation.id;
};

/**
 * A space as a person opens it, outside the organization path: the same
 * shape for a member and for an admitted guest, with nothing of the
 * organization in it. Whoever is neither gets a space that does not exist.
 */
export const findSpaceView = async (
    userId: string,
    spaceId: string
): Promise<SpaceView> => {
    const [space] = await db
        .select({
            id: spacesTable.id,
            name: spacesTable.name,
            mapId: spacesTable.mapId,
            organizationId: spacesTable.organizationId,
            guestAccess: spacesTable.guestAccess,
        })
        .from(spacesTable)
        .where(and(eq(spacesTable.id, spaceId), isNull(spacesTable.deletedAt)));
    if (!space) throw new SpaceNotFoundError();

    const membership = await findOrganizationMembership(
        userId,
        space.organizationId
    );
    const viewer = await resolveViewer(membership, userId, space.id);

    const [map, conversationId] = await Promise.all([
        MapService.findResolvedById(space.mapId),
        findConversationId(viewer, space.id),
    ]);

    return {
        id: space.id,
        name: space.name,
        conversationId,
        guestAccess: space.guestAccess,
        viewer,
        map,
    };
};
