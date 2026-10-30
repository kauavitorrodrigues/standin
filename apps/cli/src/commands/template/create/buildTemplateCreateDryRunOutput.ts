import type {
    CommandOutput,
    TemplateCreateArgs,
    TemplateCreateDryRunResult,
    TemplateInput,
} from "../../../types";
import { TEMPLATE_MESSAGES } from "../consts";
import { TEMPLATE_CREATE_MESSAGES, TEMPLATE_CREATE_STEPS } from "./consts";

export const buildTemplateCreateDryRunOutput = (
    input: TemplateInput,
    args: TemplateCreateArgs
): CommandOutput => {
    const steps: string[] = [TEMPLATE_CREATE_STEPS.CREATE];
    const lines: string[] = [
        TEMPLATE_CREATE_MESSAGES.valid(input.name, input.sizeTier),
        TEMPLATE_CREATE_MESSAGES.planCreate,
    ];
    if (args.spec) {
        steps.push(TEMPLATE_CREATE_STEPS.SPEC);
        lines.push(TEMPLATE_CREATE_MESSAGES.planSpec(args.spec));
    }
    if (input.thumbnail) {
        steps.push(TEMPLATE_CREATE_STEPS.THUMBNAIL);
        lines.push(
            TEMPLATE_CREATE_MESSAGES.planThumbnail(input.thumbnail.file)
        );
    }
    if (input.publish) {
        steps.push(TEMPLATE_CREATE_STEPS.PUBLISH);
        lines.push(TEMPLATE_CREATE_MESSAGES.planPublish);
    }
    lines.push(TEMPLATE_MESSAGES.dryRunNothing);

    const result: TemplateCreateDryRunResult = {
        dryRun: true,
        valid: true,
        name: input.name,
        sizeTier: input.sizeTier,
        steps,
    };
    return { result, lines };
};
