export type RemoveResult = {
    removedIds: string[];
    // GROUND children of a removed bundle root, now loose.
    detachedIds: string[];
    releasedDeskUserId: string | null;
};
