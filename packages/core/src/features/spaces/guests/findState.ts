import { db, spaceGuestsTable, and, eq, isNull } from "@standin/database";
import type { SpaceGuestState } from "@standin/contracts";
import { guestRowSelect } from "./consts/select";
import { serializeOptionalGuestState } from "./utils/serializeGuest";

/** What a person's own request to a space says, or null if they never asked. */
export const findSpaceGuestState = async (
    userId: string,
    spaceId: string
): Promise<SpaceGuestState | null> => {
    const [row] = await db
        .select(guestRowSelect)
        .from(spaceGuestsTable)
        .where(
            and(
                eq(spaceGuestsTable.userId, userId),
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt)
            )
        );

    return serializeOptionalGuestState(row);
};
