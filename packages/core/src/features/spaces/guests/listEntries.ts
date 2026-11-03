import type {
    SpaceGuestEntriesQuery,
    SpaceGuestEntryList,
} from "@standin/contracts";
import { SpaceGuestRepository } from "./repository";
import { serializeGuest } from "./utils/serializeGuest";
import { toListState } from "./utils/entry";

/**
 * A page of the guests of the space for the "manage guests" list, newest
 * first, with the state each one reads as.
 */
export const listSpaceGuestEntries = async (
    spaceId: string,
    query: SpaceGuestEntriesQuery
): Promise<SpaceGuestEntryList> => {
    const now = new Date();
    const { rows, total } = await SpaceGuestRepository.listEntryRows(
        spaceId,
        query,
        now
    );

    return {
        guests: rows.map((row) => {
            const guest = serializeGuest(row, now);
            return {
                ...guest,
                archivedAt: row.archivedAt?.toISOString() ?? null,
                state: toListState({
                    status: guest.status,
                    statusReason: guest.statusReason,
                    archivedAt: row.archivedAt,
                }),
            };
        }),
        total,
    };
};
