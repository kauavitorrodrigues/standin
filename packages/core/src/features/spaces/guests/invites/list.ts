import {
    db,
    spaceInviteLinksTable,
    and,
    desc,
    gt,
    isNull,
    eq,
} from "@standin/database";
import type { SpaceInviteLink } from "@standin/contracts";
import { linkSelect } from "./consts/select";
import { serializeLink } from "./utils/serializeLink";

/** The links of the space that can still be used, newest first. */
export const listInviteLinks = async (
    spaceId: string
): Promise<SpaceInviteLink[]> => {
    const links = await db
        .select(linkSelect)
        .from(spaceInviteLinksTable)
        .where(
            and(
                eq(spaceInviteLinksTable.spaceId, spaceId),
                isNull(spaceInviteLinksTable.deletedAt),
                isNull(spaceInviteLinksTable.revokedAt),
                gt(spaceInviteLinksTable.expiresAt, new Date())
            )
        )
        .orderBy(desc(spaceInviteLinksTable.createdAt));

    return links.map(serializeLink);
};
