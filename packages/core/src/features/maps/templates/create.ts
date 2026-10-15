import { mapTemplatesTable, db } from "@standin/database";
import type { MapTemplate, MapTemplateDataSchemaType } from "@standin/contracts";
import { createBlankMap } from "../createBlank";
import { templateIdSelect } from "./consts/select";
import { findTemplateById } from "./findById";

// A template is born as a draft with a blank map of the chosen tier.
export const createTemplate = async (
    createdBy: string,
    data: MapTemplateDataSchemaType
): Promise<MapTemplate> => {
    const templateId = await db.transaction(async (tx) => {
        const map = await createBlankMap(data.sizeTier, tx);

        const [template] = await tx
            .insert(mapTemplatesTable)
            .values({
                name: data.name,
                description: data.description ?? null,
                mapId: map.id,
                createdBy,
            })
            .returning(templateIdSelect);

        return template.id;
    });

    return findTemplateById(templateId);
};
