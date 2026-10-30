import type { MapTemplate } from "@standin/contracts";
import type {
    ContentApplyOptions,
    ContentTemplate,
    ContentTemplateResult,
    TemplateFlow,
    TemplateOutcome,
} from "../../../types";
import { TEMPLATE_ACTIONS } from "../../../consts/steps";
import { buildTemplate } from "../../template/shared/buildTemplate";
import { findTemplateByName } from "../../template/shared/findTemplateByName";
import { settleExistingTemplate } from "./settleExistingTemplate";

// One template of the folder: found by its name and left alone when it is
// there, otherwise created and filled. With a dry run nothing is written.
export const applyContentTemplate = async (
    flow: TemplateFlow,
    template: ContentTemplate,
    known: MapTemplate[],
    options: ContentApplyOptions
): Promise<ContentTemplateResult> => {
    const existing: MapTemplate | undefined = findTemplateByName(
        known,
        template.name
    );
    if (existing) {
        return settleExistingTemplate(flow, template, existing, options);
    }
    if (options.dryRun) {
        return {
            file: template.file,
            name: template.name,
            action: TEMPLATE_ACTIONS.WOULD_CREATE,
        };
    }

    const outcome: TemplateOutcome = await buildTemplate(flow, {
        name: template.name,
        sizeTier: template.spec.sizeTier,
        spec: template.spec,
        thumbnail: template.thumbnail,
        publish: options.publish,
    });
    return {
        file: template.file,
        name: template.name,
        action: TEMPLATE_ACTIONS.CREATED,
        id: outcome.template.id,
        status: outcome.template.status,
        opCount: outcome.opCount,
        thumbnailUploaded: outcome.thumbnailUploaded,
    };
};
