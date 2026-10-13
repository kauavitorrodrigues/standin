import { isAxiosError } from "axios";
import type { LibraryIssue } from "@standin/contracts";

export type ApiError = {
    status: number | null;
    code: string | null;
    message: string | null;
    errors: LibraryIssue[];
    warnings: LibraryIssue[];
    fields: string[];
    fieldErrors: Record<string, string[]>;
};

// The library answers `{ error, code, errors?, warnings?, fields? }`. A body
// rejected by its schema comes as a flattened Zod error with `fieldErrors`.
export const getApiError = (error: unknown): ApiError => {
    const empty: ApiError = {
        status: null,
        code: null,
        message: null,
        errors: [],
        warnings: [],
        fields: [],
        fieldErrors: {},
    };
    if (!isAxiosError(error) || !error.response) return empty;

    const data = (error.response.data ?? {}) as Record<string, unknown>;
    return {
        status: error.response.status,
        code: typeof data.code === "string" ? data.code : null,
        message: typeof data.error === "string" ? data.error : null,
        errors: Array.isArray(data.errors) ? data.errors : [],
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
        fields: Array.isArray(data.fields) ? data.fields : [],
        fieldErrors:
            typeof data.fieldErrors === "object" && data.fieldErrors !== null
                ? (data.fieldErrors as Record<string, string[]>)
                : {},
    };
};
