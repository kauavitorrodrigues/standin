import {
    db,
    spaceInviteLinksTable,
    spacesTable,
    usersTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { InviteLinkNotFoundError } from "@standin/contracts";
import type { DbExecutor } from "../../../../../lib/types";
import { hashInviteToken } from "./generateToken";

const selectLinkContext = (token: string, executor: DbExecutor) =>
    executor
        .select({
            link: {
                id: spaceInviteLinksTable.id,
                expiresAt: spaceInviteLinksTable.expiresAt,
                revokedAt: spaceInviteLinksTable.revokedAt,
                maxUses: spaceInviteLinksTable.maxUses,
                usesCount: spaceInviteLinksTable.usesCount,
                createdBy: spaceInviteLinksTable.createdBy,
            },
            space: {
                id: spacesTable.id,
                name: spacesTable.name,
                organizationId: spacesTable.organizationId,
                guestAccess: spacesTable.guestAccess,
            },
            inviterName: usersTable.name,
        })
        .from(spaceInviteLinksTable)
        .innerJoin(
            spacesTable,
            eq(spacesTable.id, spaceInviteLinksTable.spaceId)
        )
        .leftJoin(
            usersTable,
            eq(usersTable.id, spaceInviteLinksTable.createdBy)
        )
        .where(
            and(
                eq(spaceInviteLinksTable.tokenHash, hashInviteToken(token)),
                isNull(spaceInviteLinksTable.deletedAt),
                isNull(spacesTable.deletedAt)
            )
        );

/** The link behind a token with the space it opens and who made it. */
export const findLinkContext = async (
    token: string,
    executor: DbExecutor = db
) => {
    const [row] = await selectLinkContext(token, executor);
    if (!row) throw new InviteLinkNotFoundError();
    return row;
};

/**
 * Same, locking the link and the space for the rest of the transaction. The
 * requests on one link wait for each other, and a request waits for a change
 * of the guest access of the space (and the change waits for the request), so
 * neither sees a stale copy of the other.
 */
export const lockLinkContext = async (token: string, executor: DbExecutor) => {
    const [row] = await selectLinkContext(token, executor).for("update", {
        of: [spaceInviteLinksTable, spacesTable],
    });
    if (!row) throw new InviteLinkNotFoundError();
    return row;
};
