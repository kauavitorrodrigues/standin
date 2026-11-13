import { organizationInvitesTable, and, eq, isNull } from "@standin/database";
import type { DbExecutor } from "../../../../lib/types";

/**
 * Closes every invitation of an e-mail in an organization, accepted or not,
 * so none of them works again and a new one can be made.
 */
export const closeInvitationsOfEmail = async (
    executor: DbExecutor,
    organizationId: string,
    email: string,
    closedAt: Date
): Promise<void> => {
    await executor
        .update(organizationInvitesTable)
        .set({ deletedAt: closedAt })
        .where(
            and(
                eq(organizationInvitesTable.organizationId, organizationId),
                eq(organizationInvitesTable.email, email),
                isNull(organizationInvitesTable.deletedAt)
            )
        );
};
