import { db, mapTemplatesTable, and, eq, isNull } from "@standin/database";
import {
    MAP_TEMPLATE_STATUSES,
    MapTemplateNotFoundError,
    MapTemplateNotPublishedError,
} from "@standin/contracts";
import type { MapTemplate } from "@standin/contracts";
import { templateStatusSelect } from "./consts/select";
import { findTemplateById } from "./findById";

// Spaces already created from the template are copies, so they don't change.
export const retireTemplate = async (id: string): Promise<MapTemplate> => {
    const [template] = await db
        .select(templateStatusSelect)
        .from(mapTemplatesTable)
        .where(
            and(eq(mapTemplatesTable.id, id), isNull(mapTemplatesTable.deletedAt))
        );

    if (!template) throw new MapTemplateNotFoundError();
    if (template.status !== MAP_TEMPLATE_STATUSES.PUBLISHED) {
        throw new MapTemplateNotPublishedError();
    }

    await db
        .update(mapTemplatesTable)
        .set({ status: MAP_TEMPLATE_STATUSES.RETIRED })
        .where(eq(mapTemplatesTable.id, id));

    return findTemplateById(id);
};
