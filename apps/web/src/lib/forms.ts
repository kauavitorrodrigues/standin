import type { FieldPath, FieldValues } from "react-hook-form";

/**
 * Casts a literal key of a form's schema type to a `FieldPath<TFieldValues>`.
 * Needed because TypeScript can't verify a hardcoded literal against a
 * generic `TFieldValues` inside a generic component, even when `TFieldValues`
 * is constrained to a schema that has that key.
 */
export function fieldName<TFieldValues extends FieldValues, TSchema = TFieldValues>() {
    return (field: keyof TSchema) => field as unknown as FieldPath<TFieldValues>;
}
