// The strings of a list the server sent; anything else is not a list of them.
export const readStringList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is string => typeof entry === "string");
};
