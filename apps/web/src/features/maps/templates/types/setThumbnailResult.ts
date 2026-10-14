import type { LayoutIssue, MapTemplate } from "@standin/contracts";

// What PUT /templates/:templateId/thumbnail answers with. A photo in the wrong
// proportion still saves and comes back as a warning.
export type SetThumbnailResult = {
    template: MapTemplate;
    warnings: LayoutIssue[];
};
