import type { Transaction } from "@standin/database";
import {
    normalizeEmail,
    ORGANIZATION_MEMBER_ROLES,
    OrganizationMemberNotFoundError,
} from "@standin/contracts";
import type { OrganizationMemberRole } from "@standin/contracts";
import { IntegrationService } from "../../integrations";
import { DeskService } from "../../maps/desks";
import type { DeskChange } from "../../maps/desks";
import { OrganizationMemberRepository } from "./repository";

type EndedMembership = {
    role: OrganizationMemberRole;
    // The desks freed with it. Empty when nothing changed.
    freedDesks: DeskChange[];
};

/**
 * Ends the membership inside the transaction of the caller: the row is closed,
 * the invitations of the person's e-mail are closed (so only a new one brings
 * them back), the desks are freed and their connections to outside services
 * are deleted with it. The owner is left alone: nothing changes and the role
 * says so.
 *
 * @returns The role the person had. Throws when they were not a member.
 */
export const endOrganizationMembership = async (
    tx: Transaction,
    organizationId: string,
    userId: string
): Promise<EndedMembership> => {
    const now = new Date();
    const closed = await OrganizationMemberRepository.closeMembership(
        tx,
        organizationId,
        userId,
        now
    );

    if (!closed) {
        const role = await OrganizationMemberRepository.findActiveRole(
            tx,
            organizationId,
            userId
        );
        if (!role) throw new OrganizationMemberNotFoundError();
        return { role, freedDesks: [] };
    }

    const email = await OrganizationMemberRepository.findUserEmail(tx, userId);
    if (email) {
        await OrganizationMemberRepository.closeInvitationsOfEmail(
            tx,
            organizationId,
            normalizeEmail(email),
            now
        );
    }

    const freedDesks = await DeskService.releaseForMember(
        userId,
        organizationId,
        tx
    );
    await IntegrationService.disconnectMember({ organizationId, userId }, tx);
    return { role: ORGANIZATION_MEMBER_ROLES.MEMBER, freedDesks };
};
