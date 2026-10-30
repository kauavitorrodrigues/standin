import {
    db,
    organizationMembersTable,
    organizationsTable,
    and,
    count,
    desc,
    eq,
    isNull,
} from "@standin/database";
import type { AdminOrganizationSummary } from "@standin/contracts";

/** Every active organization with its number of active members. */
export const listAdminOrganizations = async (): Promise<
    AdminOrganizationSummary[]
> => {
    const rows = await db
        .select({
            id: organizationsTable.id,
            name: organizationsTable.name,
            slug: organizationsTable.slug,
            ownerId: organizationsTable.ownerId,
            memberCount: count(organizationMembersTable.id),
            createdAt: organizationsTable.createdAt,
        })
        .from(organizationsTable)
        .leftJoin(
            organizationMembersTable,
            and(
                eq(
                    organizationMembersTable.organizationId,
                    organizationsTable.id
                ),
                isNull(organizationMembersTable.deletedAt)
            )
        )
        .where(isNull(organizationsTable.deletedAt))
        .groupBy(organizationsTable.id)
        .orderBy(desc(organizationsTable.createdAt));

    return rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
    }));
};
