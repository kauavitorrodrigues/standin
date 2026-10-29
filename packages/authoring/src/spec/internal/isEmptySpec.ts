// Nothing at all, or a mapping with no field.
export const isEmptySpec = (input: unknown): boolean => {
    if (input === null || input === undefined) return true;
    if (typeof input !== "object" || Array.isArray(input)) return false;

    return Object.keys(input).length === 0;
};
