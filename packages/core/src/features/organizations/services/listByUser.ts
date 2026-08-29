import { organizationSelect } from "../consts/select";
import {
    db,
    organizationsTable,
    organizationMembersTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import type { Organization } from "@standin/contracts";

export const listOrganizationsByUser = async (
    userId: string,
): Promise<Organization[]> => {
    const rows = await db
        .select(organizationSelect)
        .from(organizationMembersTable)
        .innerJoin(
            organizationsTable,
            eq(organizationMembersTable.organizationId, organizationsTable.id),
        )
        .where(
            and(
                eq(organizationMembersTable.userId, userId),
                isNull(organizationMembersTable.deletedAt),
                isNull(organizationsTable.deletedAt),
            ),
        )
        .orderBy(organizationsTable.createdAt);

    return rows;
};
