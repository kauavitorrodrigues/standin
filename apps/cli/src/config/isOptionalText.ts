export const isOptionalText = (value: unknown): boolean =>
    value === undefined || typeof value === "string";
