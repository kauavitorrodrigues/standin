import { db, spaceInviteLinksTable, and, eq, isNull } from "@standin/database";
import { InviteLinkNotFoundError } from "@standin/contracts";
import type { SpaceInviteLink } from "@standin/contracts";
import { linkSelect } from "./consts/select";
import { serializeLink } from "./utils/serializeLink";

/**
 * Closes a link to new requests. Whoever was admitted through it stays in:
 * the access belongs to the guest, not to the link.
 */
export const revokeInviteLink = async (
    spaceId: string,
    linkId: string
): Promise<SpaceInviteLink> => {
    const [link] = await db
        .update(spaceInviteLinksTable)
        .set({ revokedAt: new Date() })
        .where(
            and(
                eq(spaceInviteLinksTable.id, linkId),
                eq(spaceInviteLinksTable.spaceId, spaceId),
                isNull(spaceInviteLinksTable.deletedAt),
                isNull(spaceInviteLinksTable.revokedAt)
            )
        )
        .returning(linkSelect);

    if (!link) throw new InviteLinkNotFoundError();
    return serializeLink(link);
};
