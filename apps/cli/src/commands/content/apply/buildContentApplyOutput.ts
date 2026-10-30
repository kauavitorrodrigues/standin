import type {
    CommandOutput,
    ContentApplyResult,
    ContentOutcome,
    ContentPlan,
} from "../../../types";
import { TEMPLATE_ACTIONS } from "../../../consts/steps";
import { CONTENT_MESSAGES } from "../consts";
import { buildLibraryLines } from "./buildLibraryLines";
import { buildTemplateLines } from "./buildTemplateLines";
import { CONTENT_APPLY_MESSAGES } from "./consts";

export const buildContentApplyOutput = (
    folder: string,
    plan: ContentPlan,
    outcome: ContentOutcome,
    dryRun: boolean
): CommandOutput => {
    const result: ContentApplyResult = {
        dryRun,
        folder,
        library: outcome.library,
        templates: outcome.templates,
        warnings: plan.warnings,
    };
    const lines: string[] = [];
    if (plan.library && outcome.library) {
        lines.push(...buildLibraryLines(plan.library, outcome.library));
    }
    for (const template of outcome.templates) {
        lines.push(...buildTemplateLines(template));
    }
    if (
        outcome.templates.some(
            ({ action }) => action === TEMPLATE_ACTIONS.EXISTS
        )
    ) {
        lines.push(CONTENT_APPLY_MESSAGES.existsHint);
    }
    for (const warning of plan.warnings) {
        lines.push(CONTENT_MESSAGES.warning(warning));
    }
    if (dryRun) lines.push(CONTENT_APPLY_MESSAGES.dryRun);
    return { result, lines };
};
