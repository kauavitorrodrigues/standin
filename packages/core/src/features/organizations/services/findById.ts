import { organizationSelect } from "../consts/select";
import { db, organizationsTable, eq, and, isNull } from "@standin/database";
import type { Organization } from "@standin/contracts";

export const findOrganizationById = async (
    id: string
): Promise<Organization | null> => {
    const [organization] = await db
        .select(organizationSelect)
        .from(organizationsTable)
        .where(
            and(
                eq(organizationsTable.id, id),
                isNull(organizationsTable.deletedAt)
            )
        );

    return organization ?? null;
};
