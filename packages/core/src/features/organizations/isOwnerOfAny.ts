import {
    db,
    organizationMembersTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";

/** Does the user own at least one organization? */
export const isOwnerOfAnyOrganization = async (
    userId: string
): Promise<boolean> => {
    const [owned] = await db
        .select({ id: organizationMembersTable.id })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.userId, userId),
                eq(
                    organizationMembersTable.role,
                    ORGANIZATION_MEMBER_ROLES.OWNER
                ),
                isNull(organizationMembersTable.deletedAt)
            )
        )
        .limit(1);

    return Boolean(owned);
};
