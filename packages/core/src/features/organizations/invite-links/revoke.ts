import {
    db,
    organizationInviteLinksTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { InviteLinkNotFoundError } from "@standin/contracts";
import type { OrganizationInviteLink } from "@standin/contracts";
import { linkSelect } from "./consts";
import { serializeLink } from "./utils/serializeLink";

/** Closes a link. Whoever already signed up through it stays in. */
export const revokeOrganizationInviteLink = async (
    organizationId: string,
    linkId: string
): Promise<OrganizationInviteLink> => {
    const [link] = await db
        .update(organizationInviteLinksTable)
        .set({ revokedAt: new Date() })
        .where(
            and(
                eq(organizationInviteLinksTable.id, linkId),
                eq(organizationInviteLinksTable.organizationId, organizationId),
                isNull(organizationInviteLinksTable.deletedAt),
                isNull(organizationInviteLinksTable.revokedAt)
            )
        )
        .returning(linkSelect);

    if (!link) throw new InviteLinkNotFoundError();
    return serializeLink(link);
};
