import {
    MAX_CLOSED_GUESTS,
    SPACE_GUEST_STATUSES,
    type SpaceGuest,
    type SpaceGuestList,
} from "@standin/contracts";

const byRequestedAtDesc = (a: SpaceGuest, b: SpaceGuest): number =>
    b.requestedAt.localeCompare(a.requestedAt);

const byRequestedAtAsc = (a: SpaceGuest, b: SpaceGuest): number =>
    a.requestedAt.localeCompare(b.requestedAt);

/**
 * Puts the guests in the groups the hosts act on. The waiting ones come oldest
 * first, so the first to ask is the first answered; the others newest first.
 * Only the most recent closed ones are kept.
 */
export const groupGuests = (guests: readonly SpaceGuest[]): SpaceGuestList => {
    const groups: SpaceGuestList = { pending: [], admitted: [], closed: [] };

    for (const guest of guests) {
        switch (guest.status) {
            case SPACE_GUEST_STATUSES.PENDING:
                groups.pending.push(guest);
                break;
            case SPACE_GUEST_STATUSES.ADMITTED:
                groups.admitted.push(guest);
                break;
            default:
                groups.closed.push(guest);
        }
    }

    groups.pending.sort(byRequestedAtAsc);
    groups.admitted.sort(byRequestedAtDesc);
    groups.closed.sort(byRequestedAtDesc);
    groups.closed = groups.closed.slice(0, MAX_CLOSED_GUESTS);

    return groups;
};
