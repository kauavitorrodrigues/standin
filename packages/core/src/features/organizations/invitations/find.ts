import {
    db,
    organizationInvitesTable,
    organizationsTable,
    usersTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import {
    OrganizationInvitationExpiredError,
    OrganizationInvitationNotFoundError,
} from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { hashInviteToken } from "../../spaces/guests/invites/utils/generateToken";

/** The open invitation behind a token, with its organization and inviter. */
export const findInvitationContext = async (
    token: string,
    executor: DbExecutor = db
) => {
    const [row] = await executor
        .select({
            id: organizationInvitesTable.id,
            email: organizationInvitesTable.email,
            createdBy: organizationInvitesTable.createdBy,
            spaceId: organizationInvitesTable.spaceId,
            mapAssetId: organizationInvitesTable.mapAssetId,
            expiresAt: organizationInvitesTable.expiresAt,
            organizationId: organizationsTable.id,
            organizationName: organizationsTable.name,
            inviterName: usersTable.name,
        })
        .from(organizationInvitesTable)
        .innerJoin(
            organizationsTable,
            eq(organizationsTable.id, organizationInvitesTable.organizationId)
        )
        .leftJoin(
            usersTable,
            eq(usersTable.id, organizationInvitesTable.createdBy)
        )
        .where(
            and(
                eq(organizationInvitesTable.tokenHash, hashInviteToken(token)),
                isNull(organizationInvitesTable.deletedAt),
                isNull(organizationInvitesTable.acceptedAt),
                isNull(organizationsTable.deletedAt)
            )
        );

    if (!row) throw new OrganizationInvitationNotFoundError();
    if (row.expiresAt.getTime() <= Date.now()) {
        throw new OrganizationInvitationExpiredError();
    }
    return row;
};
