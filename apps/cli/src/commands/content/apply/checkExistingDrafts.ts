import type { MapTemplate } from "@standin/contracts";
import type { ContentPlan, ErrorIssue } from "../../../types";
import { TEMPLATE_STATUS_DRAFT } from "../../template/consts";
import { findTemplateByName } from "../../template/shared/findTemplateByName";
import { CONTENT_MESSAGES } from "../consts";

// With --publish an existing draft is published as it is, and the server
// refuses a draft that has no thumbnail. Such a draft was left by a run that
// stopped before its thumbnail, so it is reported before anything is written.
export const checkExistingDrafts = (
    plan: ContentPlan,
    known: MapTemplate[],
    publish: boolean
): ErrorIssue[] => {
    if (!publish) return [];
    const issues: ErrorIssue[] = [];
    for (const { name, file } of plan.templates) {
        const existing: MapTemplate | undefined = findTemplateByName(
            known,
            name
        );
        if (existing?.status !== TEMPLATE_STATUS_DRAFT) continue;
        if (existing.thumbnailUrl) continue;
        issues.push({
            file,
            message: CONTENT_MESSAGES.draftWithoutThumbnail(name, existing.id),
        });
    }
    return issues;
};
