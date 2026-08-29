import { spaceSelect } from "../consts/select";
import { db, spacesTable, eq, and, isNull } from "@standin/database";
import type { Space } from "@standin/contracts";

export const listSpacesByOrganization = async (
    organizationId: string,
): Promise<Space[]> => {
    const spaces = await db
        .select(spaceSelect)
        .from(spacesTable)
        .where(
            and(
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt),
            ),
        )
        .orderBy(spacesTable.createdAt);

    return spaces;
};
