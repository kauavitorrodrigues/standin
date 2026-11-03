/** A contains-pattern for ILIKE, with the wildcards of the text escaped. */
export const buildSearchPattern = (search: string): string =>
    `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
