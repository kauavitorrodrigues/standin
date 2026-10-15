import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ASSET_SCHEMA_FIELD_TO_FORM_FIELDS } from "../consts/formFields";
import type { ApiError } from "./getApiError";

type SchemaField = keyof typeof ASSET_SCHEMA_FIELD_TO_FORM_FIELDS;

const isSchemaField = (path: string): path is SchemaField =>
    path in ASSET_SCHEMA_FIELD_TO_FORM_FIELDS;

const rootOf = (path: string) => path.split(".")[0] ?? path;

// Puts each error on the field its path points to. Returns the messages
// that matched no field, to be shown above the form.
export const applyApiErrorToForm = <TValues extends FieldValues>(
    error: ApiError,
    setError: UseFormSetError<TValues>
): string[] => {
    const unplaced: string[] = [];
    const place = (schemaField: string, message: string) => {
        const root = rootOf(schemaField);
        if (!isSchemaField(root)) {
            unplaced.push(message);
            return;
        }
        for (const formField of ASSET_SCHEMA_FIELD_TO_FORM_FIELDS[root]) {
            setError(formField as Path<TValues>, { message });
        }
    };

    for (const issue of error.errors) place(issue.path, issue.message);
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
        for (const message of messages) place(field, message);
    }
    for (const field of error.fields) place(field, "Em uso por mapas.");

    const placedByIssues =
        error.errors.length > 0 || Object.keys(error.fieldErrors).length > 0;
    if (!placedByIssues && error.message) unplaced.unshift(error.message);

    return unplaced;
};
