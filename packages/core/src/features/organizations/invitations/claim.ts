import {
    organizationInvitesTable,
    and,
    eq,
    gt,
    isNull,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import { OrganizationInvitationNotFoundError } from "@standin/contracts";

/**
 * Takes the invitation for good. The update is the check: two people (or the
 * same one twice) taking it at once cannot both win, and one cancelled or
 * expired meanwhile is refused.
 */
export const claimInvitation = async (
    tx: Transaction,
    invitationId: string
): Promise<void> => {
    const [claimed] = await tx
        .update(organizationInvitesTable)
        .set({ acceptedAt: new Date() })
        .where(
            and(
                eq(organizationInvitesTable.id, invitationId),
                isNull(organizationInvitesTable.acceptedAt),
                isNull(organizationInvitesTable.deletedAt),
                gt(organizationInvitesTable.expiresAt, new Date())
            )
        )
        .returning({ id: organizationInvitesTable.id });

    if (!claimed) throw new OrganizationInvitationNotFoundError();
};
