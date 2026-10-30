/** Makes a search term literal inside ILIKE, where % and _ are wildcards. */
export const escapeLike = (term: string): string =>
    term.replace(/[\\%_]/g, (char) => `\\${char}`);
