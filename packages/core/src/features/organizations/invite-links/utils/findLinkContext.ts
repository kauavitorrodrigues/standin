import {
    db,
    organizationInviteLinksTable,
    organizationsTable,
    usersTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { InviteLinkNotFoundError } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";
import { hashInviteToken } from "../../../spaces/guests/invites/utils/generateToken";

const selectLinkContext = (token: string, executor: DbExecutor) =>
    executor
        .select({
            link: {
                id: organizationInviteLinksTable.id,
                role: organizationInviteLinksTable.role,
                expiresAt: organizationInviteLinksTable.expiresAt,
                revokedAt: organizationInviteLinksTable.revokedAt,
                maxUses: organizationInviteLinksTable.maxUses,
                usesCount: organizationInviteLinksTable.usesCount,
            },
            organization: {
                id: organizationsTable.id,
                name: organizationsTable.name,
            },
            inviterName: usersTable.name,
        })
        .from(organizationInviteLinksTable)
        .innerJoin(
            organizationsTable,
            eq(
                organizationsTable.id,
                organizationInviteLinksTable.organizationId
            )
        )
        .leftJoin(
            usersTable,
            eq(usersTable.id, organizationInviteLinksTable.createdBy)
        )
        .where(
            and(
                eq(
                    organizationInviteLinksTable.tokenHash,
                    hashInviteToken(token)
                ),
                isNull(organizationInviteLinksTable.deletedAt),
                isNull(organizationsTable.deletedAt)
            )
        );

/** The link behind a token with the organization it opens and who made it. */
export const findLinkContext = async (
    token: string,
    executor: DbExecutor = db
) => {
    const [row] = await selectLinkContext(token, executor);
    if (!row) throw new InviteLinkNotFoundError();
    return row;
};

/** Same, locking the link so the sign ups on one link wait for each other. */
export const lockLinkContext = async (token: string, executor: DbExecutor) => {
    const [row] = await selectLinkContext(token, executor).for("update", {
        of: [organizationInviteLinksTable],
    });
    if (!row) throw new InviteLinkNotFoundError();
    return row;
};
