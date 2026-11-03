import {
    db,
    organizationInvitesTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { OrganizationInvitationNotFoundError } from "@standin/contracts";
import { publishOrganizationMembersChanged } from "../members/membersChangedEvents";

/** Closes an invitation. The link stops working. */
export const cancelOrganizationInvitation = async (
    organizationId: string,
    invitationId: string
): Promise<void> => {
    const [row] = await db
        .update(organizationInvitesTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(organizationInvitesTable.id, invitationId),
                eq(organizationInvitesTable.organizationId, organizationId),
                isNull(organizationInvitesTable.deletedAt),
                isNull(organizationInvitesTable.acceptedAt)
            )
        )
        .returning({ id: organizationInvitesTable.id });
    if (!row) throw new OrganizationInvitationNotFoundError();
    await publishOrganizationMembersChanged({ organizationId });
};
