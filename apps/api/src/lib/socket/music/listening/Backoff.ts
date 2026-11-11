// Spotify limits each app, and each organization has its own, so a 429 pauses
// the polling of that organization only.
const until = new Map<string, number>();

const isBackedOff = (organizationId: string, now: number): boolean => {
    const limit = until.get(organizationId);
    if (limit === undefined) return false;
    if (now < limit) return true;

    until.delete(organizationId);
    return false;
};

const backOff = (organizationId: string, now: number, waitMs: number) => {
    until.set(organizationId, now + waitMs);
};

const clear = () => until.clear();

export const ListeningBackoff = { isBackedOff, backOff, clear };
