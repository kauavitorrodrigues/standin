import { spaceSelect } from "./consts/select";
import { db, spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type { Space, SpaceUpdateSchemaType } from "@standin/contracts";

export const updateSpace = async (
    organizationId: string,
    id: string,
    data: SpaceUpdateSchemaType
): Promise<Space> => {
    const [space] = await db
        .update(spacesTable)
        .set(data)
        .where(
            and(
                eq(spacesTable.id, id),
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt)
            )
        )
        .returning(spaceSelect);

    if (!space) throw new SpaceNotFoundError();

    return space;
};
