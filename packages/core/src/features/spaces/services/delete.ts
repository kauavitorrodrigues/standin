import { spaceSelect } from "../consts/select";
import { db, spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type { Space } from "@standin/contracts";

export const deleteSpace = async (
    organizationId: string,
    id: string,
): Promise<Space> => {
    const [space] = await db
        .update(spacesTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(spacesTable.id, id),
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt),
            ),
        )
        .returning(spaceSelect);

    if (!space) throw new SpaceNotFoundError();

    return space;
};
