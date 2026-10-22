import {
    db,
    spaceGuestsTable,
    spacesTable,
    and,
    asc,
    eq,
    gt,
    isNull,
} from "@standin/database";
import { SPACE_GUEST_ACCESS, SPACE_GUEST_STATUSES } from "@standin/contracts";
import type { GuestSpace } from "@standin/contracts";

/** The spaces a person can enter as a guest right now, for their home. */
export const listGuestSpaces = async (
    userId: string
): Promise<GuestSpace[]> => {
    const rows = await db
        .select({
            id: spacesTable.id,
            name: spacesTable.name,
            expiresAt: spaceGuestsTable.expiresAt,
        })
        .from(spaceGuestsTable)
        .innerJoin(spacesTable, eq(spacesTable.id, spaceGuestsTable.spaceId))
        .where(
            and(
                eq(spaceGuestsTable.userId, userId),
                eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.ADMITTED),
                gt(spaceGuestsTable.expiresAt, new Date()),
                isNull(spaceGuestsTable.deletedAt),
                eq(spacesTable.guestAccess, SPACE_GUEST_ACCESS.ALLOWED),
                isNull(spacesTable.deletedAt)
            )
        )
        .orderBy(asc(spacesTable.name));

    return rows.map((row) => ({
        ...row,
        expiresAt: row.expiresAt.toISOString(),
    }));
};
