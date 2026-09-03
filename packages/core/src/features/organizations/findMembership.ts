import {
    db,
    organizationMembersTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import type { OrganizationMembership } from "@standin/contracts";

export const findOrganizationMembership = async (
    userId: string,
    organizationId: string
): Promise<OrganizationMembership | null> => {
    const [membership] = await db
        .select({
            id: organizationMembersTable.id,
            userId: organizationMembersTable.userId,
            organizationId: organizationMembersTable.organizationId,
            role: organizationMembersTable.role,
        })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.userId, userId),
                eq(organizationMembersTable.organizationId, organizationId),
                isNull(organizationMembersTable.deletedAt)
            )
        );

    return membership ?? null;
};
