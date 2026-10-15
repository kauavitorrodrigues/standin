import { mapsTable, mapTemplatesTable, and, eq, isNull } from "@standin/database";
import { MAP_TEMPLATE_STATUSES } from "@standin/contracts";
import type { MapSizeTier, MapTemplate } from "@standin/contracts";
import { selectTemplates } from "./utils/queryTemplates";
import { serializeTemplate } from "./utils/serializeTemplate";

// What an organization sees when creating a space.
export const listPublishedTemplates = async (
    sizeTier?: MapSizeTier
): Promise<MapTemplate[]> => {
    const templates = await selectTemplates()
        .where(
            and(
                isNull(mapTemplatesTable.deletedAt),
                isNull(mapTemplatesTable.organizationId),
                eq(mapTemplatesTable.status, MAP_TEMPLATE_STATUSES.PUBLISHED),
                sizeTier ? eq(mapsTable.sizeTier, sizeTier) : undefined
            )
        )
        .orderBy(mapTemplatesTable.name);

    return Promise.all(templates.map(serializeTemplate));
};
