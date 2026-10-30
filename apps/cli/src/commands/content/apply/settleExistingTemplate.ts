import type { MapTemplate } from "@standin/contracts";
import {
    STEP_ACTIONS,
    STEP_TARGETS,
    TEMPLATE_ACTIONS,
} from "../../../consts/steps";
import type {
    ContentApplyOptions,
    ContentTemplate,
    ContentTemplateResult,
    StepRef,
    TemplateFlow,
} from "../../../types";
import { recordStep } from "../../shared/recordStep";
import { trackWrite } from "../../shared/trackWrite";
import {
    TEMPLATE_STATUS_DRAFT,
    TEMPLATE_STATUS_PUBLISHED,
} from "../../template/consts";
import { publishTemplateOnServer } from "../../template/shared/publishTemplateOnServer";

// A template that already has the name is never built again. The one thing
// left to do is publishing a draft, and only when --publish says so. (A draft
// without a thumbnail was refused before anything was written.)
export const settleExistingTemplate = async (
    { http, target, progress }: TemplateFlow,
    template: ContentTemplate,
    existing: MapTemplate,
    { publish, dryRun }: ContentApplyOptions
): Promise<ContentTemplateResult> => {
    const base: ContentTemplateResult = {
        file: template.file,
        name: template.name,
        action: TEMPLATE_ACTIONS.EXISTS,
        id: existing.id,
        status: existing.status,
    };
    if (!publish) return base;
    if (existing.status === TEMPLATE_STATUS_PUBLISHED) {
        return { ...base, action: TEMPLATE_ACTIONS.UNCHANGED };
    }
    if (existing.status !== TEMPLATE_STATUS_DRAFT) return base;
    if (dryRun) return { ...base, action: TEMPLATE_ACTIONS.WOULD_PUBLISH };

    const step: StepRef = {
        target: STEP_TARGETS.TEMPLATE,
        name: template.name,
    };
    const published: MapTemplate = await trackWrite(progress, step, () =>
        publishTemplateOnServer(http, target, existing.id)
    );
    recordStep(progress, step, STEP_ACTIONS.PUBLISHED, existing.id);
    return {
        ...base,
        action: TEMPLATE_ACTIONS.PUBLISHED,
        status: published.status,
    };
};
