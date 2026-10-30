import type {
    CommandOutput,
    ContentPlan,
    ContentTemplate,
    ContentTemplateSummary,
    ContentValidateResult,
} from "../../../types";
import { CONTENT_MESSAGES } from "../consts";
import { summarizeCounts } from "../shared/summarizeCounts";
import { CONTENT_VALIDATE_MESSAGES } from "./consts";

export const buildContentValidateOutput = (
    folder: string,
    plan: ContentPlan
): CommandOutput => {
    const templates: ContentTemplateSummary[] = plan.templates.map(
        ({ file, name, spec, thumbnail }: ContentTemplate) => ({
            file,
            name,
            sizeTier: spec.sizeTier,
            thumbnail: thumbnail !== undefined,
        })
    );
    const result: ContentValidateResult = {
        valid: true,
        folder,
        templates,
        warnings: plan.warnings,
    };
    const lines: string[] = [CONTENT_VALIDATE_MESSAGES.valid(folder)];

    if (plan.library) {
        result.library = {
            files: plan.library.images.length,
            counts: plan.library.counts,
        };
        lines.push(
            CONTENT_VALIDATE_MESSAGES.library(
                plan.library.images.length,
                summarizeCounts(plan.library.counts)
            )
        );
    }
    for (const template of templates) {
        lines.push(
            CONTENT_VALIDATE_MESSAGES.template(
                template.file,
                template.name,
                template.sizeTier
            )
        );
        if (template.thumbnail) {
            lines.push(CONTENT_VALIDATE_MESSAGES.withThumbnail);
        }
        if (!template.thumbnail) {
            lines.push(CONTENT_VALIDATE_MESSAGES.withoutThumbnail);
        }
    }
    for (const warning of plan.warnings) {
        lines.push(CONTENT_MESSAGES.warning(warning));
    }
    lines.push(CONTENT_VALIDATE_MESSAGES.localOnly);
    return { result, lines };
};
