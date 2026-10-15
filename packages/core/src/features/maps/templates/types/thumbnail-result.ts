import type { LayoutIssue, MapTemplate } from "@standin/contracts";

export type ThumbnailResult = {
    template: MapTemplate;
    warnings: LayoutIssue[];
};
