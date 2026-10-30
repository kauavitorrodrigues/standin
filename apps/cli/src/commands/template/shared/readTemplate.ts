import type { MapTemplate } from "@standin/contracts";
import { ApiResponseInvalidError } from "../../../errors/ApiResponseInvalidError";
import { TEMPLATE_STRING_FIELDS } from "../consts";

// A template the server sent, checked for the fields the CLI relies on. An
// answer that lacks them is not the API (a proxy, another version).
export const readTemplate = (value: unknown): MapTemplate => {
    if (typeof value !== "object" || value === null) {
        throw new ApiResponseInvalidError();
    }
    const candidate: Record<string, unknown> = value as Record<string, unknown>;
    for (const field of TEMPLATE_STRING_FIELDS) {
        if (typeof candidate[field] !== "string") {
            throw new ApiResponseInvalidError();
        }
    }
    return value as MapTemplate;
};
