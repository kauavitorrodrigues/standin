import type { MapTemplateUpdateSchemaType } from "@standin/contracts";

export type UpdateTemplateInput = MapTemplateUpdateSchemaType & {
    templateId: string;
};
