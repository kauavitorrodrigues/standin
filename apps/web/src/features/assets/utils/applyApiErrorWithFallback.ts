import type { FieldValues, UseFormSetError } from "react-hook-form";
import { applyApiErrorToForm } from "./applyApiErrorToForm";
import { getApiError } from "./getApiError";

// Puts what the API said on the fields it points to, and what matched no field
// above the form. When it said nothing, the fallback does.
export const applyApiErrorWithFallback = <TValues extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<TValues>,
    fallback: string
): void => {
    const apiError = getApiError(error);
    const unplaced = applyApiErrorToForm(apiError, setError);
    const hasNothingToSay =
        unplaced.length === 0 && apiError.errors.length === 0;
    const lines = hasNothingToSay ? [fallback] : unplaced;
    if (lines.length === 0) return;
    // `root` is the form itself, not one of its fields.
    setError("root" as Parameters<typeof setError>[0], {
        message: lines.join("\n"),
    });
};
