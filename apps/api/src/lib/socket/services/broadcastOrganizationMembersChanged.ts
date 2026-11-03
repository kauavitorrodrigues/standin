import { OrganizationEvents } from "@standin/contracts";
import { OrganizationMemberService } from "@standin/core";
import type { OrganizationMembersChange } from "@standin/core";
import { SocketManager } from "../socketManager";

/**
 * Tells the owners of an organization that its people or invitations changed.
 * They are who see those lists, so no one else hears it (the e-mails of the
 * lists stay private) and nothing the others see is sent.
 */
export const broadcastOrganizationMembersChanged = async ({
    organizationId,
}: OrganizationMembersChange): Promise<void> => {
    const ownerIds = await OrganizationMemberService.findOwnerIds(organizationId);
    for (const ownerId of ownerIds) {
        SocketManager.emitToUser(
            ownerId,
            OrganizationEvents.MEMBERS_CHANGED,
            { organizationId }
        );
    }
};
