import {
    db,
    organizationMembersTable,
    and,
    eq,
    inArray,
    isNull,
} from "@standin/database";

/** Which of the given people are active members of the organization. */
export const findActiveMemberIdsAmong = async (
    organizationId: string,
    userIds: string[]
): Promise<string[]> => {
    if (userIds.length === 0) return [];

    const rows = await db
        .select({ userId: organizationMembersTable.userId })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.organizationId, organizationId),
                inArray(organizationMembersTable.userId, userIds),
                isNull(organizationMembersTable.deletedAt)
            )
        );
    return rows.map((row) => row.userId);
};
