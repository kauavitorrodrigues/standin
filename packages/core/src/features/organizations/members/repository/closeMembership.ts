import { organizationMembersTable, and, eq, isNull } from "@standin/database";
import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";

/**
 * Closes the row of a plain member. The owner is never closed here: the role
 * in the condition is the guard, so nothing can race it.
 *
 * @returns True when a row was closed.
 */
export const closeOrganizationMembership = async (
    executor: DbExecutor,
    organizationId: string,
    userId: string,
    closedAt: Date
): Promise<boolean> => {
    const closed = await executor
        .update(organizationMembersTable)
        .set({ deletedAt: closedAt })
        .where(
            and(
                eq(organizationMembersTable.organizationId, organizationId),
                eq(organizationMembersTable.userId, userId),
                eq(
                    organizationMembersTable.role,
                    ORGANIZATION_MEMBER_ROLES.MEMBER
                ),
                isNull(organizationMembersTable.deletedAt)
            )
        )
        .returning({ id: organizationMembersTable.id });
    return closed.length > 0;
};
