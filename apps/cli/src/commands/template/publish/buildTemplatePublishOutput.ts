import type { MapTemplate } from "@standin/contracts";
import type { CommandOutput, TemplatePublishResult } from "../../../types";
import { TEMPLATE_MESSAGES } from "../consts";

export const buildTemplatePublishOutput = (
    template: MapTemplate
): CommandOutput => {
    const result: TemplatePublishResult = { dryRun: false, template };
    return {
        result,
        lines: [TEMPLATE_MESSAGES.published(template.name, template.id)],
    };
};
