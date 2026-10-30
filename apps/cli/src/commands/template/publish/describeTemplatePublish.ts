import type { MapTemplate } from "@standin/contracts";
import { TEMPLATE_MESSAGES, TEMPLATE_STATUS_DRAFT } from "../consts";

// What a dry run says about publishing the template: only a draft can be.
export const describeTemplatePublish = (template: MapTemplate): string => {
    if (template.status === TEMPLATE_STATUS_DRAFT) {
        return TEMPLATE_MESSAGES.wouldPublish(template.name, template.id);
    }
    return TEMPLATE_MESSAGES.notDraft(
        template.name,
        template.id,
        template.status
    );
};
