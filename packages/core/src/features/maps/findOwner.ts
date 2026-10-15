import {
    db,
    spacesTable,
    mapTemplatesTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import type { DbExecutor } from "../../lib/types";
import { MAP_OWNER_KINDS } from "./consts/owner";
import { mapOwnerSpaceSelect, mapOwnerTemplateSelect } from "./consts/select";
import type { MapOwner } from "./types/map-owner";

/** A map belongs to exactly one space or one template. */
export const findMapOwner = async (
    mapId: string,
    executor: DbExecutor = db
): Promise<MapOwner> => {
    const [space] = await executor
        .select(mapOwnerSpaceSelect)
        .from(spacesTable)
        .where(
            and(eq(spacesTable.mapId, mapId), isNull(spacesTable.deletedAt))
        );

    if (space) {
        return {
            kind: MAP_OWNER_KINDS.SPACE,
            spaceId: space.id,
            organizationId: space.organizationId,
        };
    }

    const [template] = await executor
        .select(mapOwnerTemplateSelect)
        .from(mapTemplatesTable)
        .where(
            and(
                eq(mapTemplatesTable.mapId, mapId),
                isNull(mapTemplatesTable.deletedAt)
            )
        );

    if (!template) throw new MapNotFoundError();

    return {
        kind: MAP_OWNER_KINDS.TEMPLATE,
        templateId: template.id,
        organizationId: template.organizationId,
    };
};
