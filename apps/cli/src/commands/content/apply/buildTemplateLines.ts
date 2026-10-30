import type { ContentTemplateResult } from "../../../types";
import { TEMPLATE_ACTIONS } from "../../../consts/steps";
import { CONTENT_APPLY_MESSAGES } from "./consts";

// What a person reads about one template of the folder.
export const buildTemplateLines = (
    template: ContentTemplateResult
): string[] => {
    const { name, id, status }: ContentTemplateResult = template;
    switch (template.action) {
        case TEMPLATE_ACTIONS.CREATED: {
            const lines: string[] = [
                CONTENT_APPLY_MESSAGES.templateCreated(
                    name,
                    id ?? "",
                    status ?? ""
                ),
            ];
            if (template.opCount !== undefined) {
                lines.push(
                    CONTENT_APPLY_MESSAGES.templateOps(template.opCount)
                );
            }
            if (template.thumbnailUploaded) {
                lines.push(CONTENT_APPLY_MESSAGES.templateThumbnail);
            }
            return lines;
        }
        case TEMPLATE_ACTIONS.PUBLISHED:
            return [CONTENT_APPLY_MESSAGES.templatePublished(name, id ?? "")];
        case TEMPLATE_ACTIONS.EXISTS:
            return [
                CONTENT_APPLY_MESSAGES.templateExists(
                    name,
                    id ?? "",
                    status ?? ""
                ),
            ];
        case TEMPLATE_ACTIONS.UNCHANGED:
            return [CONTENT_APPLY_MESSAGES.templateUnchanged(name, id ?? "")];
        case TEMPLATE_ACTIONS.WOULD_CREATE:
            return [CONTENT_APPLY_MESSAGES.wouldCreate(name)];
        case TEMPLATE_ACTIONS.WOULD_PUBLISH:
            return [CONTENT_APPLY_MESSAGES.wouldPublish(name, id ?? "")];
    }
};
