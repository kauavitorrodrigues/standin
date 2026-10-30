import type { MapTemplate } from "@standin/contracts";
import type { CommandOutput, TemplateListResult } from "../../../types";
import { TEMPLATE_MESSAGES } from "../consts";

export const buildTemplateListOutput = (
    templates: MapTemplate[]
): CommandOutput => {
    const result: TemplateListResult = { templates };
    const lines: string[] = [
        TEMPLATE_MESSAGES.count(templates.length),
        ...templates.map(({ id, status, sizeTier, name }) =>
            TEMPLATE_MESSAGES.row(id, status, sizeTier, name)
        ),
    ];
    return { result, lines };
};
