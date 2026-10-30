import type { TemplateInput } from "../../../types";

// The body of POST /templates: the description only when there is one.
export const buildCreateBody = (input: TemplateInput): object => {
    const body: Record<string, string> = {
        name: input.name,
        sizeTier: input.sizeTier,
    };
    if (input.description) body.description = input.description;
    return body;
};
