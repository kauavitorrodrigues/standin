import { getApiError } from "./getApiError";

// What goes above a form when the API refuses it: each problem it listed, or
// its own message, or the fallback.
export const getRootErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    const { errors, message } = getApiError(error);
    if (errors.length > 0)
        return errors.map((issue) => issue.message).join("\n");
    return message ?? fallback;
};
