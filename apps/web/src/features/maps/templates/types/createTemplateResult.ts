import type { MapTemplate } from "@standin/contracts";

// What POST /templates answers with. The ids repeat what is inside the
// template so the caller can navigate without unpacking it.
export type CreateTemplateResult = {
    template: MapTemplate;
    templateId: string;
    mapId: string;
};
