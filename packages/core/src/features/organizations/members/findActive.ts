import { organizationMembersTable, eq, and, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";

export const findActiveOrganizationMembers = async (
    organizationId: string,
    tx: Transaction
): Promise<{ userId: string }[]> => {
    return tx
        .select({ userId: organizationMembersTable.userId })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.organizationId, organizationId),
                isNull(organizationMembersTable.deletedAt)
            )
        );
};
