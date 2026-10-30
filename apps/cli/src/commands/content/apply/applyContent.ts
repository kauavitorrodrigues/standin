import type { MapTemplate } from "@standin/contracts";
import { STEP_TARGETS } from "../../../consts/steps";
import { ContentInvalidError } from "../../../errors/ContentInvalidError";
import { TemplateNotPublishableError } from "../../../errors/TemplateNotPublishableError";
import type {
    ContentApplyOptions,
    ContentOutcome,
    ContentPlan,
    ContentTemplateResult,
    ErrorIssue,
    TemplateFlow,
} from "../../../types";
import { fetchTemplates } from "../../template/shared/fetchTemplates";
import { applyContentTemplate } from "./applyContentTemplate";
import { applyLibrary } from "./applyLibrary";
import { checkExistingDrafts } from "./checkExistingDrafts";
import { checkPublishThumbnails } from "./checkPublishThumbnails";
import { removePending } from "./removePending";

// The templates of the instance are read first, and what --publish asks for
// is checked against them, so nothing is written for a run that cannot
// finish. Then the library, then the templates, one after the other. The
// first failure stops the run: what was done is in the progress of the flow.
export const applyContent = async (
    flow: TemplateFlow,
    plan: ContentPlan,
    options: ContentApplyOptions
): Promise<ContentOutcome> => {
    const { http, target, progress }: TemplateFlow = flow;
    const outcome: ContentOutcome = { templates: [] };

    let known: MapTemplate[] = [];
    if (plan.templates.length > 0) {
        known = await fetchTemplates(http, target);
        const missing: ErrorIssue[] = checkPublishThumbnails(
            plan,
            known,
            options.publish
        );
        if (missing.length > 0) throw new ContentInvalidError(missing);
        const drafts: ErrorIssue[] = checkExistingDrafts(
            plan,
            known,
            options.publish
        );
        if (drafts.length > 0) throw new TemplateNotPublishableError(drafts);
    }

    if (plan.library) {
        outcome.library = await applyLibrary(flow, plan.library, options);
    }
    for (const template of plan.templates) {
        const result: ContentTemplateResult = await applyContentTemplate(
            flow,
            template,
            known,
            options
        );
        outcome.templates.push(result);
        removePending(progress, {
            target: STEP_TARGETS.TEMPLATE,
            name: template.name,
        });
    }
    return outcome;
};
