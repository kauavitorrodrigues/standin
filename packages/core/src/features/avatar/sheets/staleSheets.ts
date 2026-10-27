// The people whose sheet could not be assembled again after a part or a base
// changed. Kept in memory on purpose: joining a space must not read the
// database to find out if a sheet is stale, so the failure is remembered
// where it happened and paid back at the next join of that person.
const staleUserIds = new Set<string>();

export const markSheetStale = (userId: string): void => {
    staleUserIds.add(userId);
};

// True once for a person marked, so the retry runs once per failure.
export const consumeStaleSheet = (userId: string): boolean =>
    staleUserIds.delete(userId);
