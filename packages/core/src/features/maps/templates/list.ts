import { mapsTable, mapTemplatesTable, and, eq, isNull } from "@standin/database";
import type { MapSizeTier, MapTemplate } from "@standin/contracts";
import { selectTemplates } from "./utils/queryTemplates";
import { serializeTemplate } from "./utils/serializeTemplate";

// Every global template, whatever its status. Admin only.
export const listTemplates = async (
    sizeTier?: MapSizeTier
): Promise<MapTemplate[]> => {
    const templates = await selectTemplates()
        .where(
            and(
                isNull(mapTemplatesTable.deletedAt),
                isNull(mapTemplatesTable.organizationId),
                sizeTier ? eq(mapsTable.sizeTier, sizeTier) : undefined
            )
        )
        .orderBy(mapTemplatesTable.createdAt);

    return Promise.all(templates.map(serializeTemplate));
};
