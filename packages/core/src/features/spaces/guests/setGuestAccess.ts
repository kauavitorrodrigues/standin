import {
    db,
    spaceGuestsTable,
    spacesTable,
    and,
    eq,
    inArray,
    isNull,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    SPACE_GUEST_ACCESS,
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
    SpaceNotFoundError,
} from "@standin/contracts";
import type { Space, SpaceGuestAccess } from "@standin/contracts";
import { spaceSelect } from "../consts/select";
import { serializeSpace } from "../utils/serializeSpace";
import { guestRowSelect } from "./consts/select";
import {
    publishGuestListChanged,
    publishSpaceGuestEvent,
} from "./utils/guestEvents";
import { serializeGuestState } from "./utils/serializeGuest";
import type { GuestRow } from "./types";

type DeniedByAccess = {
    rows: GuestRow[];
    wasAdmitted: ReadonlySet<string>;
};

const NOBODY: DeniedByAccess = { rows: [], wasAdmitted: new Set() };

// The rows are locked while they are read, so a request answered at the same
// moment is either seen here with its new status or waits for this to finish.
// The space row, locked by the update before this runs, also holds back the
// requests that would otherwise slip in unseen.
const denyEveryLiveGuest = async (
    tx: Transaction,
    spaceId: string,
    now: Date
): Promise<DeniedByAccess> => {
    const live = await tx
        .select({ id: spaceGuestsTable.id, status: spaceGuestsTable.status })
        .from(spaceGuestsTable)
        .where(
            and(
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt),
                inArray(spaceGuestsTable.status, [
                    SPACE_GUEST_STATUSES.PENDING,
                    SPACE_GUEST_STATUSES.ADMITTED,
                ])
            )
        )
        .for("update");
    if (live.length === 0) return NOBODY;

    const rows = await tx
        .update(spaceGuestsTable)
        .set({
            status: SPACE_GUEST_STATUSES.DENIED,
            statusReason: SPACE_GUEST_STATUS_REASONS.GUEST_ACCESS_DISABLED,
            respondedAt: now,
        })
        .where(
            inArray(
                spaceGuestsTable.id,
                live.map(({ id }) => id)
            )
        )
        .returning(guestRowSelect);

    const wasAdmitted = new Set(
        live
            .filter(({ status }) => status === SPACE_GUEST_STATUSES.ADMITTED)
            .map(({ id }) => id)
    );
    return { rows, wasAdmitted };
};

/**
 * Turns guest access on or off for a space. Turning it off denies the waiting
 * requests and sends out the admitted guests, with the reason that says why.
 */
export const setSpaceGuestAccess = async (
    organizationId: string,
    spaceId: string,
    guestAccess: SpaceGuestAccess
): Promise<Space> => {
    const now = new Date();

    const { space, denied } = await db.transaction(async (tx) => {
        const [updated] = await tx
            .update(spacesTable)
            .set({ guestAccess })
            .where(
                and(
                    eq(spacesTable.id, spaceId),
                    eq(spacesTable.organizationId, organizationId),
                    isNull(spacesTable.deletedAt)
                )
            )
            .returning(spaceSelect);
        if (!updated) throw new SpaceNotFoundError();

        if (guestAccess === SPACE_GUEST_ACCESS.ALLOWED) {
            return { space: updated, denied: NOBODY };
        }

        return {
            space: updated,
            denied: await denyEveryLiveGuest(tx, spaceId, now),
        };
    });

    for (const row of denied.rows) {
        await publishSpaceGuestEvent({
            type: "status",
            userId: row.userId,
            state: serializeGuestState(row, now),
        });
        if (denied.wasAdmitted.has(row.id)) {
            await publishSpaceGuestEvent({
                type: "removed",
                spaceId,
                userId: row.userId,
            });
        }
    }
    await publishGuestListChanged(spaceId);

    return serializeSpace(space);
};
