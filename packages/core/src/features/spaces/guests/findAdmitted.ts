import {
    db,
    spaceGuestsTable,
    spacesTable,
    and,
    eq,
    gt,
    isNull,
} from "@standin/database";
import { SPACE_GUEST_ACCESS, SPACE_GUEST_STATUSES } from "@standin/contracts";
import type { AdmittedGuest } from "./types";

/**
 * The guest pass that lets a person into a space right now, or null: admitted,
 * inside the 24h, and the space still takes guests. A pending request never
 * counts.
 */
export const findAdmittedSpaceGuest = async (
    userId: string,
    spaceId: string
): Promise<AdmittedGuest | null> => {
    const [row] = await db
        .select({
            id: spaceGuestsTable.id,
            spaceId: spaceGuestsTable.spaceId,
            userId: spaceGuestsTable.userId,
            expiresAt: spaceGuestsTable.expiresAt,
        })
        .from(spaceGuestsTable)
        .innerJoin(spacesTable, eq(spacesTable.id, spaceGuestsTable.spaceId))
        .where(
            and(
                eq(spaceGuestsTable.userId, userId),
                eq(spaceGuestsTable.spaceId, spaceId),
                eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.ADMITTED),
                gt(spaceGuestsTable.expiresAt, new Date()),
                isNull(spaceGuestsTable.deletedAt),
                eq(spacesTable.guestAccess, SPACE_GUEST_ACCESS.ALLOWED),
                isNull(spacesTable.deletedAt)
            )
        );

    return row ?? null;
};
