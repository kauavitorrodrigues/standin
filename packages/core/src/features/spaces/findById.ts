import { serializeSpace } from "./utils/serializeSpace";
import { selectSpaces } from "./utils/querySpaces";
import { spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type { Space } from "@standin/contracts";

export const findSpaceById = async (
    organizationId: string,
    id: string
): Promise<Space> => {
    const [space] = await selectSpaces().where(
        and(
            eq(spacesTable.id, id),
            eq(spacesTable.organizationId, organizationId),
            isNull(spacesTable.deletedAt)
        )
    );

    if (!space) throw new SpaceNotFoundError();

    return serializeSpace(space);
};
