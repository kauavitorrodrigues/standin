import type { MapTemplate } from "@standin/contracts";
import type { CommandOutput, TemplateGetResult } from "../../../types";
import { TEMPLATE_MESSAGES } from "../consts";

const NONE: string = "none";

export const buildTemplateGetOutput = (
    template: MapTemplate
): CommandOutput => {
    const result: TemplateGetResult = { template };
    const lines: string[] = [
        `${template.name} (${template.id})`,
        TEMPLATE_MESSAGES.field("status", template.status),
        TEMPLATE_MESSAGES.field("size tier", template.sizeTier),
        TEMPLATE_MESSAGES.field("size", `${template.width}x${template.height}`),
        TEMPLATE_MESSAGES.field("map", template.mapId),
        TEMPLATE_MESSAGES.field("description", template.description ?? NONE),
        TEMPLATE_MESSAGES.field("thumbnail", template.thumbnailUrl ?? NONE),
        TEMPLATE_MESSAGES.field("created", template.createdAt),
    ];
    return { result, lines };
};
