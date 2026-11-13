import {
    db,
    organizationMembersTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";

/** The active owners of an organization: who runs its invites. */
export const findOrganizationOwnerIds = async (
    organizationId: string
): Promise<string[]> => {
    const rows = await db
        .select({ userId: organizationMembersTable.userId })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.organizationId, organizationId),
                eq(
                    organizationMembersTable.role,
                    ORGANIZATION_MEMBER_ROLES.OWNER
                ),
                isNull(organizationMembersTable.deletedAt)
            )
        );
    return rows.map((row) => row.userId);
};
