/** How an entry is named in a refusal, e.g. `areas "town"`. */
export const buildEntryLabel = (collection: string, key: string): string =>
    `${collection} "${key}"`;
