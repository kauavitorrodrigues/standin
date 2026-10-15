import type { Transaction } from "@standin/database";
import { MapTemplateUnavailableError } from "@standin/contracts";
import type { SpaceDataSchemaType } from "@standin/contracts";
import { MapService } from "../../maps";
import { MapTemplateService } from "../../maps/templates";

// The space gets its own map: a copy of a published template, or a blank map
// of the chosen tier.
export const createSpaceMap = async (
    organizationId: string,
    data: SpaceDataSchemaType,
    tx: Transaction
) => {
    if (data.templateId) {
        const template = await MapTemplateService.findAvailable(
            data.templateId,
            organizationId
        );
        if (!template) throw new MapTemplateUnavailableError();

        return MapService.copy(template.mapId, organizationId, tx);
    }

    return MapService.createBlank(data.sizeTier!, tx);
};
