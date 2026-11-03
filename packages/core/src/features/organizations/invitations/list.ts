import {
    db,
    organizationInvitesTable,
    and,
    count,
    desc,
    eq,
    gt,
    ilike,
    isNull,
} from "@standin/database";
import type {
    OrganizationInvitation,
    Page,
    PageQuery,
} from "@standin/contracts";
import { buildSearchPattern } from "../../../lib/buildSearchPattern";
import { invitationSelect } from "./select";
import { serializeInvitations } from "./utils";

/**
 * A page of the invitations of the organization still waiting, newest first.
 * The search matches the e-mail.
 */
export const listOrganizationInvitations = async (
    organizationId: string,
    { page, take, search }: PageQuery
): Promise<Page<OrganizationInvitation>> => {
    const where = and(
        eq(organizationInvitesTable.organizationId, organizationId),
        isNull(organizationInvitesTable.deletedAt),
        isNull(organizationInvitesTable.acceptedAt),
        gt(organizationInvitesTable.expiresAt, new Date()),
        search
            ? ilike(organizationInvitesTable.email, buildSearchPattern(search))
            : undefined
    );

    const [totalRow] = await db
        .select({ total: count() })
        .from(organizationInvitesTable)
        .where(where);

    const rows = await db
        .select(invitationSelect)
        .from(organizationInvitesTable)
        .where(where)
        // The id breaks ties so a page never repeats or skips an invitation.
        .orderBy(
            desc(organizationInvitesTable.createdAt),
            desc(organizationInvitesTable.id)
        )
        .limit(take)
        .offset((page - 1) * take);

    return {
        items: serializeInvitations(rows),
        total: totalRow?.total ?? 0,
    };
};
