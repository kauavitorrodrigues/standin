import {
    db,
    spaceGuestsTable,
    spaceInviteLinksTable,
    and,
    eq,
} from "@standin/database";

/** The validity the link of a guest sets, in hours. Null: no end. */
export const findLinkValidity = async (
    spaceId: string,
    guestId: string
): Promise<number | null> => {
    const [row] = await db
        .select({ hours: spaceInviteLinksTable.guestValidityHours })
        .from(spaceGuestsTable)
        .innerJoin(
            spaceInviteLinksTable,
            eq(spaceInviteLinksTable.id, spaceGuestsTable.inviteLinkId)
        )
        .where(
            and(
                eq(spaceGuestsTable.id, guestId),
                eq(spaceGuestsTable.spaceId, spaceId)
            )
        );
    return row?.hours ?? null;
};
