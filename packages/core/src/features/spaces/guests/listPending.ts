import {
    db,
    spaceGuestsTable,
    userProfilePicturesTable,
    usersTable,
    and,
    asc,
    eq,
    gt,
    isNull,
} from "@standin/database";
import { SPACE_GUEST_STATUSES } from "@standin/contracts";
import type { SpaceGuest } from "@standin/contracts";
import { guestRowWithNameSelect } from "./consts/select";
import { serializeGuest } from "./utils/serializeGuest";
import { profilePictureJoin } from "../../users/utils/profilePictureJoin";

/** The requests still waiting for a host, the first to ask first. */
export const listPendingSpaceGuests = async (
    spaceId: string
): Promise<SpaceGuest[]> => {
    const now = new Date();
    const rows = await db
        .select(guestRowWithNameSelect)
        .from(spaceGuestsTable)
        .innerJoin(usersTable, eq(usersTable.id, spaceGuestsTable.userId))
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(
            and(
                eq(spaceGuestsTable.spaceId, spaceId),
                eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.PENDING),
                gt(spaceGuestsTable.expiresAt, now),
                isNull(spaceGuestsTable.deletedAt)
            )
        )
        .orderBy(asc(spaceGuestsTable.requestedAt));

    return rows.map((row) => serializeGuest(row, now));
};
