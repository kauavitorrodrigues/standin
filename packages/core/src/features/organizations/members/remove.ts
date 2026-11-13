import { db } from "@standin/database";
import {
    ORGANIZATION_MEMBER_ROLES,
    OrganizationNotFoundError,
    OrganizationOwnerCannotBeRemovedError,
    OrganizationOwnerOnlyError,
} from "@standin/contracts";
import { findOrganizationById } from "../findById";
import { findOrganizationMembership } from "../findMembership";
import { endOrganizationMembership } from "./endMembership";
import { publishOrganizationMemberRemoved } from "./memberRemovedEvents";
import { publishOrganizationMembersChanged } from "./membersChangedEvents";

/**
 * The owner removes a member. Messages stay with the person's name. Once it is
 * saved, the sockets of the person lose their access and they get a notice.
 */
export const removeOrganizationMember = async (
    actorId: string,
    organizationId: string,
    userId: string
): Promise<void> => {
    const actor = await findOrganizationMembership(actorId, organizationId);
    if (actor?.role !== ORGANIZATION_MEMBER_ROLES.OWNER) {
        throw new OrganizationOwnerOnlyError();
    }

    const organization = await findOrganizationById(organizationId);
    if (!organization) throw new OrganizationNotFoundError();

    const { role, freedDesks } = await db.transaction((tx) =>
        endOrganizationMembership(tx, organizationId, userId)
    );
    if (role === ORGANIZATION_MEMBER_ROLES.OWNER) {
        throw new OrganizationOwnerCannotBeRemovedError();
    }

    await publishOrganizationMemberRemoved({
        userId,
        organizationId,
        notice: { organizationName: organization.name, reason: "removed" },
        freedDesks,
    });
    await publishOrganizationMembersChanged({ organizationId });
};
