export const toISOStringOrNull = (date: Date | null): string | null =>
    date ? date.toISOString() : null;
