// The sockets of the hosts of a space (members of its organization). Requests
// of guests are heard here and nowhere else, so an admitted guest never sees
// who else is knocking.
export const buildHostRoom = (spaceId: string): string =>
    `space-hosts:${spaceId}`;
