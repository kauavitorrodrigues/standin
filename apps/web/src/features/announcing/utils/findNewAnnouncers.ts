import type { SpaceAnnouncer } from "@standin/contracts";

// The announcers of the new list that were not in the previous one, by socket
// id. Someone who was already there, or who left, is not new.
export const findNewAnnouncers = (
    previous: readonly SpaceAnnouncer[],
    next: readonly SpaceAnnouncer[]
): SpaceAnnouncer[] => {
    const known = new Set(previous.map((announcer) => announcer.socketId));
    return next.filter((announcer) => !known.has(announcer.socketId));
};
