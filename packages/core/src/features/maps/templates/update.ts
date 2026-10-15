import { db, mapTemplatesTable, and, eq, isNull } from "@standin/database";
import { MapTemplateNotFoundError } from "@standin/contracts";
import type { MapTemplate, MapTemplateUpdateSchemaType } from "@standin/contracts";
import { templateIdSelect } from "./consts/select";
import { findTemplateById } from "./findById";

export const updateTemplate = async (
    id: string,
    data: MapTemplateUpdateSchemaType
): Promise<MapTemplate> => {
    const updated = await db
        .update(mapTemplatesTable)
        .set({ name: data.name, description: data.description ?? null })
        .where(and(eq(mapTemplatesTable.id, id), isNull(mapTemplatesTable.deletedAt)))
        .returning(templateIdSelect);

    if (updated.length === 0) throw new MapTemplateNotFoundError();

    return findTemplateById(id);
};
