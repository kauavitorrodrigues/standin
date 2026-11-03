import {
    db,
    organizationMembersTable,
    usersTable,
    and,
    eq,
    inArray,
    isNull,
} from "@standin/database";
import {
    ORGANIZATION_INVITATION_LIFETIME_DAYS,
    OrganizationInvitationDeskUnavailableError,
} from "@standin/contracts";
import type {
    OrganizationInvitationCreateInput,
    OrganizationInvitationCreated,
} from "@standin/contracts";
import { daysFromNow } from "../../../lib/daysFromNow";
import { SpaceService } from "../../spaces";
import { listDesksToKeep } from "./desks";
import type { InvitationRow } from "./types";
import { upsertInvitation } from "./upsert";
import { serializeInvitations } from "./utils";
import { publishOrganizationMembersChanged } from "../members/membersChangedEvents";

const findMemberEmails = async (
    organizationId: string,
    emails: string[]
): Promise<Set<string>> => {
    const rows = await db
        .select({ email: usersTable.email })
        .from(usersTable)
        .innerJoin(
            organizationMembersTable,
            eq(organizationMembersTable.userId, usersTable.id)
        )
        .where(
            and(
                eq(organizationMembersTable.organizationId, organizationId),
                isNull(organizationMembersTable.deletedAt),
                isNull(usersTable.deletedAt),
                inArray(usersTable.email, emails)
            )
        );
    return new Set(rows.map((row) => row.email));
};

// A desk can be kept for one person: it has to be free, kept by no other open
// invitation, and not asked for several people at once.
const assertDeskCanBeKept = async (
    organizationId: string,
    input: OrganizationInvitationCreateInput,
    emails: string[]
): Promise<void> => {
    if (!input.spaceId || !input.mapAssetId) return;

    const isForSeveralPeople = emails.length > 1;
    const available = await listDesksToKeep(
        organizationId,
        input.spaceId,
        emails
    );
    const isAvailable = available.some(
        (desk) => desk.mapAssetId === input.mapAssetId
    );
    if (isForSeveralPeople || !isAvailable) {
        throw new OrganizationInvitationDeskUnavailableError();
    }
};

/**
 * Makes an invitation for each e-mail, all or none. Who is already a member is
 * skipped. An e-mail with an invitation still open gets it renewed (same link,
 * new date, new desk), so asking twice never makes two.
 */
export const createOrganizationInvitations = async (
    organizationId: string,
    createdBy: string,
    input: OrganizationInvitationCreateInput
): Promise<OrganizationInvitationCreated> => {
    if (input.spaceId) {
        await SpaceService.assertInOrganization(input.spaceId, organizationId);
    }

    const emails = [...new Set(input.emails)];
    const members = await findMemberEmails(organizationId, emails);
    const fresh = emails.filter((email) => !members.has(email));
    await assertDeskCanBeKept(organizationId, input, fresh);

    const expiresAt = daysFromNow(ORGANIZATION_INVITATION_LIFETIME_DAYS);
    // One after the other: they share one connection and lock their rows.
    const rows = await db.transaction(async (tx) => {
        const made: InvitationRow[] = [];
        for (const email of fresh) {
            made.push(
                await upsertInvitation(tx, {
                    organizationId,
                    createdBy,
                    email,
                    spaceId: input.spaceId,
                    mapAssetId: input.mapAssetId,
                    expiresAt,
                })
            );
        }
        return made;
    });

    if (rows.length > 0)
        await publishOrganizationMembersChanged({ organizationId });

    return {
        invitations: serializeInvitations(rows),
        skippedEmails: emails.filter((email) => members.has(email)),
    };
};
