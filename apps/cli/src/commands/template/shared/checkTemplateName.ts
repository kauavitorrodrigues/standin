import { MAX_MAP_TEMPLATE_NAME_LENGTH } from "@standin/contracts";
import { TEMPLATE_NAME_MIN_LENGTH, TEMPLATE_NAME_PROBLEM } from "../consts";

// The problem with a template name, or undefined when the server takes it.
export const checkTemplateName = (name: string): string | undefined => {
    if (name.length < TEMPLATE_NAME_MIN_LENGTH) return TEMPLATE_NAME_PROBLEM;
    if (name.length > MAX_MAP_TEMPLATE_NAME_LENGTH) {
        return TEMPLATE_NAME_PROBLEM;
    }
    return undefined;
};
