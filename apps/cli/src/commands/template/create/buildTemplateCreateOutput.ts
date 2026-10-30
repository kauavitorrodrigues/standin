import type {
    CommandOutput,
    TemplateCreateResult,
    TemplateOutcome,
} from "../../../types";
import { TEMPLATE_MESSAGES } from "../consts";

export const buildTemplateCreateOutput = (
    outcome: TemplateOutcome
): CommandOutput => {
    const { template, mapId, opCount }: TemplateOutcome = outcome;
    const result: TemplateCreateResult = {
        dryRun: false,
        template,
        mapId,
        opCount,
        thumbnailUploaded: outcome.thumbnailUploaded,
        published: outcome.published,
    };
    const lines: string[] = [
        TEMPLATE_MESSAGES.created(template.name, template.id, template.status),
    ];
    if (opCount !== undefined) {
        lines.push(TEMPLATE_MESSAGES.specApplied(opCount, mapId));
    }
    if (outcome.thumbnailUploaded) {
        lines.push(TEMPLATE_MESSAGES.thumbnailUploaded);
    }
    if (outcome.published) {
        lines.push(TEMPLATE_MESSAGES.published(template.name, template.id));
    }
    if (!outcome.published) {
        lines.push(TEMPLATE_MESSAGES.stillDraft(template.id));
    }
    return { result, lines };
};
