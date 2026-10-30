import path from "node:path";
import type { MapTemplate } from "@standin/contracts";
import type { ContentPlan, ErrorIssue } from "../../../types";
import { findTemplateByName } from "../../template/shared/findTemplateByName";
import { CONTENT_MESSAGES } from "../consts";

// With --publish a template that will be made needs its thumbnail beside the
// spec: the server refuses to publish one without it. A template that
// already exists is not made again, so it needs none here.
export const checkPublishThumbnails = (
    plan: ContentPlan,
    known: MapTemplate[],
    publish: boolean
): ErrorIssue[] => {
    if (!publish) return [];
    return plan.templates
        .filter(({ name }) => findTemplateByName(known, name) === undefined)
        .filter(({ thumbnail }) => thumbnail === undefined)
        .map(({ file }) => ({
            file,
            message: CONTENT_MESSAGES.publishNeedsThumbnail(
                path.parse(file).name
            ),
        }));
};
