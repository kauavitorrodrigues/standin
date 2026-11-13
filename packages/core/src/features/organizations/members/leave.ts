import { db } from "@standin/database";
import {
    ORGANIZATION_MEMBER_ROLES,
    OrganizationNotFoundError,
    OrganizationOwnerCannotLeaveError,
} from "@standin/contracts";
import { findOrganizationById } from "../findById";
import { endOrganizationMembership } from "./endMembership";
import { publishOrganizationMemberRemoved } from "./memberRemovedEvents";
import { publishOrganizationMembersChanged } from "./membersChangedEvents";

/**
 * A member leaves. The owner cannot: an organization needs its owner, and
 * there is only one. Once it is saved the sockets of the person lose their
 * access, and their other tabs are told so they leave too.
 */
export const leaveOrganization = async (
    userId: string,
    organizationId: string
): Promise<void> => {
    const organization = await findOrganizationById(organizationId);
    if (!organization) throw new OrganizationNotFoundError();

    const { role, freedDesks } = await db.transaction((tx) =>
        endOrganizationMembership(tx, organizationId, userId)
    );
    if (role === ORGANIZATION_MEMBER_ROLES.OWNER) {
        throw new OrganizationOwnerCannotLeaveError();
    }

    await publishOrganizationMemberRemoved({
        userId,
        organizationId,
        notice: { organizationName: organization.name, reason: "left" },
        freedDesks,
    });
    await publishOrganizationMembersChanged({ organizationId });
};
