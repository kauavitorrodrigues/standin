/** The object without the fields that are undefined. */
export const stripUndefined = <T extends object>(value: T): T =>
    Object.fromEntries(
        Object.entries(value).filter(([, field]) => field !== undefined)
    ) as T;
