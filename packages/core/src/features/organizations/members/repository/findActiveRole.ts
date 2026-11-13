import { organizationMembersTable, and, eq, isNull } from "@standin/database";
import type { OrganizationMemberRole } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";

/** The role of an active member, or null when the person is not one. */
export const findActiveMemberRole = async (
    executor: DbExecutor,
    organizationId: string,
    userId: string
): Promise<OrganizationMemberRole | null> => {
    const [row] = await executor
        .select({ role: organizationMembersTable.role })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.organizationId, organizationId),
                eq(organizationMembersTable.userId, userId),
                isNull(organizationMembersTable.deletedAt)
            )
        );
    return row?.role ?? null;
};
