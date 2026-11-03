import {
    db,
    spaceGuestsTable,
    userProfilePicturesTable,
    usersTable,
    and,
    count,
    desc,
    eq,
    ilike,
    isNull,
} from "@standin/database";
import type { SpaceGuestEntriesQuery } from "@standin/contracts";
import { buildSearchPattern } from "../../../../lib/buildSearchPattern";
import { profilePictureJoin } from "../../../users/utils/profilePictureJoin";
import { guestRowWithNameSelect } from "../consts/select";
import type { GuestEntryRowPage } from "../types";
import { listStateCondition } from "../utils/listStateFilter";

/**
 * A page of the guests of the space, newest first, and how many match in all.
 * The search matches the name and the state narrows as the list labels it at
 * `now`.
 */
export const listGuestEntryRows = async (
    spaceId: string,
    { page, take, search, state }: SpaceGuestEntriesQuery,
    now: Date
): Promise<GuestEntryRowPage> => {
    const where = and(
        eq(spaceGuestsTable.spaceId, spaceId),
        isNull(spaceGuestsTable.deletedAt),
        search ? ilike(usersTable.name, buildSearchPattern(search)) : undefined,
        state ? listStateCondition(state, now) : undefined
    );

    // The count and the page are two reads: under a write they can differ by
    // one, which the next refetch settles.
    const [totalRow] = await db
        .select({ total: count() })
        .from(spaceGuestsTable)
        .innerJoin(usersTable, eq(usersTable.id, spaceGuestsTable.userId))
        .where(where);

    const rows = await db
        .select({
            ...guestRowWithNameSelect,
            archivedAt: spaceGuestsTable.archivedAt,
        })
        .from(spaceGuestsTable)
        .innerJoin(usersTable, eq(usersTable.id, spaceGuestsTable.userId))
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(where)
        // The id breaks ties so a page never repeats or skips a guest.
        .orderBy(desc(spaceGuestsTable.requestedAt), desc(spaceGuestsTable.id))
        .limit(take)
        .offset((page - 1) * take);

    return { rows, total: totalRow?.total ?? 0 };
};
