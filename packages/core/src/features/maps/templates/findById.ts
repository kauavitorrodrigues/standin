import { mapTemplatesTable, and, eq, isNull } from "@standin/database";
import { MapTemplateNotFoundError } from "@standin/contracts";
import type { MapTemplate } from "@standin/contracts";
import { selectTemplates } from "./utils/queryTemplates";
import { serializeTemplate } from "./utils/serializeTemplate";

export const findTemplateById = async (id: string): Promise<MapTemplate> => {
    const [template] = await selectTemplates().where(
        and(eq(mapTemplatesTable.id, id), isNull(mapTemplatesTable.deletedAt))
    );

    if (!template) throw new MapTemplateNotFoundError();

    return serializeTemplate(template);
};
