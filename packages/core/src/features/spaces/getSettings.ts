import { db, spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type { SpaceSettings } from "@standin/contracts";
import { spaceSettingsSelect, toSpaceSettings } from "./utils/spaceSettings";

export const getSpaceSettings = async (
    organizationId: string,
    spaceId: string
): Promise<SpaceSettings> => {
    const [space] = await db
        .select(spaceSettingsSelect)
        .from(spacesTable)
        .where(
            and(
                eq(spacesTable.id, spaceId),
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt)
            )
        );

    if (!space) throw new SpaceNotFoundError();

    return toSpaceSettings(space);
};
