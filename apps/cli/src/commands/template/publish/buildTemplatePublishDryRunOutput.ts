import type { MapTemplate } from "@standin/contracts";
import type { CommandOutput, TemplatePublishResult } from "../../../types";
import { TEMPLATE_MESSAGES } from "../consts";
import { describeTemplatePublish } from "./describeTemplatePublish";

export const buildTemplatePublishDryRunOutput = (
    template: MapTemplate
): CommandOutput => {
    const result: TemplatePublishResult = { dryRun: true, template };
    return {
        result,
        lines: [
            describeTemplatePublish(template),
            TEMPLATE_MESSAGES.dryRunNothing,
        ],
    };
};
