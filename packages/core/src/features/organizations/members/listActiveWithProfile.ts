import { db, organizationMembersTable, eq, and, isNull } from "@standin/database";
import type { UserSummary } from "@standin/contracts";
import { UserService } from "../../users";

// Same active-membership scope as findActiveOrganizationMembers, but
// resolved to name/avatar. Needed by UI pickers (e.g. "start a new DM"),
// unlike the bare userId list that's enough for the createSpace fan-out.
export const listActiveOrganizationMembersWithProfile = async (
    organizationId: string
): Promise<UserSummary[]> => {
    const rows = await db
        .select({ userId: organizationMembersTable.userId })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.organizationId, organizationId),
                isNull(organizationMembersTable.deletedAt)
            )
        );

    return UserService.findManyByIds(rows.map((row) => row.userId));
};
