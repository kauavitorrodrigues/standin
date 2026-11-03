import {
    db,
    spaceInviteLinksTable,
    and,
    eq,
    isNotNull,
    isNull,
} from "@standin/database";
import type { SpaceFixedLink } from "@standin/contracts";
import type { DbExecutor } from "../../../../../lib/types";
import { fixedLinkSelect } from "../consts/fixed";
import type { FixedLinkRow } from "../types";

/** A link that is alive and keeps its token: the fixed one of the space. */
export const isFixedLinkOf = (spaceId: string) =>
    and(
        eq(spaceInviteLinksTable.spaceId, spaceId),
        isNull(spaceInviteLinksTable.deletedAt),
        isNull(spaceInviteLinksTable.revokedAt),
        isNotNull(spaceInviteLinksTable.tokenEncrypted)
    );

export const findFixedLinkRow = async (
    spaceId: string,
    executor: DbExecutor = db
): Promise<FixedLinkRow | undefined> => {
    const [row] = await executor
        .select(fixedLinkSelect)
        .from(spaceInviteLinksTable)
        .where(isFixedLinkOf(spaceId));
    return row;
};

export const serializeFixedLink = (
    row: FixedLinkRow,
    token: string
): SpaceFixedLink => ({
    id: row.id,
    spaceId: row.spaceId,
    token,
    guestValidityHours: row.guestValidityHours,
    createdAt: row.createdAt.toISOString(),
});
