// The API signs each TURN credential with a TTL (one hour by default, twenty
// minutes for a guest), and credentials are checked every time a relay
// allocation is created: a new link, or an ICE restart. The list is refetched
// at half of the shortest TTL so the copy in use is never close to expiring.
export const ICE_SERVERS_REFETCH_INTERVAL_MS = 10 * 60 * 1000;
