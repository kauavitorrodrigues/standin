import type { MapTemplate } from "@standin/contracts";
import { TEMPLATE_STATUS_RETIRED } from "../consts";

// The template that has the name. A retired one is only found when no other
// has it, so a name taken again after a retirement finds the live template.
export const findTemplateByName = (
    templates: MapTemplate[],
    name: string
): MapTemplate | undefined => {
    const matches: MapTemplate[] = templates.filter(
        (template) => template.name === name
    );
    const live: MapTemplate | undefined = matches.find(
        (template) => template.status !== TEMPLATE_STATUS_RETIRED
    );
    return live ?? matches[0];
};
