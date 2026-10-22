import {
    db,
    spaceGuestsTable,
    userProfilePicturesTable,
    usersTable,
    and,
    desc,
    eq,
    isNull,
    ne,
} from "@standin/database";
import type { SQL } from "@standin/database";
import { MAX_CLOSED_GUESTS, SPACE_GUEST_STATUSES } from "@standin/contracts";
import type { SpaceGuestList } from "@standin/contracts";
import { guestRowWithNameSelect } from "./consts/select";
import { groupGuests } from "./utils/groupGuests";
import { serializeGuest } from "./utils/serializeGuest";
import { profilePictureJoin } from "../../users/utils/profilePictureJoin";

const selectGuests = (spaceId: string, statusFilter: SQL) =>
    db
        .select(guestRowWithNameSelect)
        .from(spaceGuestsTable)
        .innerJoin(usersTable, eq(usersTable.id, spaceGuestsTable.userId))
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(
            and(
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt),
                statusFilter
            )
        )
        .orderBy(desc(spaceGuestsTable.requestedAt));

/**
 * The requests and guests of the space for the hosts, grouped by what a host
 * can do with each one. Every request still alive is there; of the closed ones
 * only the most recent, so the list does not grow with the history. A lapsed
 * row already reads as closed, so a stale one is never shown as alive.
 */
export const listSpaceGuests = async (
    spaceId: string
): Promise<SpaceGuestList> => {
    const now = new Date();
    const [alive, closed] = await Promise.all([
        selectGuests(
            spaceId,
            ne(spaceGuestsTable.status, SPACE_GUEST_STATUSES.DENIED)
        ),
        selectGuests(
            spaceId,
            eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.DENIED)
        ).limit(MAX_CLOSED_GUESTS),
    ]);

    return groupGuests(
        [...alive, ...closed].map((row) => serializeGuest(row, now))
    );
};
