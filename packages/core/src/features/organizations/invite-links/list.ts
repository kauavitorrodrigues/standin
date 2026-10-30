import {
    db,
    organizationInviteLinksTable,
    and,
    desc,
    eq,
    gt,
    isNull,
} from "@standin/database";
import type { OrganizationInviteLink } from "@standin/contracts";
import { linkSelect } from "./consts";
import { serializeLink } from "./utils/serializeLink";

/** The links of the organization that can still be used, newest first. */
export const listOrganizationInviteLinks = async (
    organizationId: string
): Promise<OrganizationInviteLink[]> => {
    const links = await db
        .select(linkSelect)
        .from(organizationInviteLinksTable)
        .where(
            and(
                eq(organizationInviteLinksTable.organizationId, organizationId),
                isNull(organizationInviteLinksTable.deletedAt),
                isNull(organizationInviteLinksTable.revokedAt),
                gt(organizationInviteLinksTable.expiresAt, new Date())
            )
        )
        .orderBy(desc(organizationInviteLinksTable.createdAt));

    return links.map(serializeLink);
};
