import { serializeSpace } from "./utils/serializeSpace";
import { selectSpaces } from "./utils/querySpaces";
import { spacesTable, eq, and, isNull } from "@standin/database";
import type { Space } from "@standin/contracts";

export const listSpacesByOrganization = async (
    organizationId: string
): Promise<Space[]> => {
    const spaces = await selectSpaces()
        .where(
            and(
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt)
            )
        )
        .orderBy(spacesTable.createdAt);

    return Promise.all(spaces.map(serializeSpace));
};
