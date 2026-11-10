/** A query value that is a non-empty string, or null. */
export const readQueryString = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    if (value.length === 0) return null;

    return value;
};
