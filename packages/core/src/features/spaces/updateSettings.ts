import { db, spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type {
    SpaceSettings,
    SpaceSettingsUpdateSchemaType,
} from "@standin/contracts";
import { spaceSettingsSelect, toSpaceSettings } from "./utils/spaceSettings";

// Only the keys sent change. Each setting is its own column, so two saves of
// different keys at the same time do not overwrite each other.
export const updateSpaceSettings = async (
    organizationId: string,
    spaceId: string,
    data: SpaceSettingsUpdateSchemaType
): Promise<SpaceSettings> => {
    const where = and(
        eq(spacesTable.id, spaceId),
        eq(spacesTable.organizationId, organizationId),
        isNull(spacesTable.deletedAt)
    );

    // An empty save changes nothing, and an UPDATE with no columns is an error.
    const [space] =
        Object.keys(data).length === 0
            ? await db.select(spaceSettingsSelect).from(spacesTable).where(where)
            : await db
                .update(spacesTable)
                .set(data)
                .where(where)
                .returning(spaceSettingsSelect);

    if (!space) throw new SpaceNotFoundError();

    return toSpaceSettings(space);
};
