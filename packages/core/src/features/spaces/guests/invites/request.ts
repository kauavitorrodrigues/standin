import {
    db,
    spaceGuestsTable,
    spaceInviteLinksTable,
    and,
    eq,
    isNull,
    lt,
    lte,
    or,
    sql,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    GuestAccessDisabledError,
    InviteLinkExhaustedError,
    SPACE_GUEST_ACCESS,
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import type { InviteRequestResult } from "@standin/contracts";
import { findOrganizationMembership } from "../../../organizations/findMembership";
import { guestRowSelect } from "../consts/select";
import type { GuestRow } from "../types";
import { publishSpaceGuestEvent } from "../utils/guestEvents";
import { hasLivePass, windowEnd } from "../utils/guestState";
import { loadGuest } from "../utils/loadGuest";
import {
    serializeGuestState,
    serializeOptionalGuestState,
} from "../utils/serializeGuest";
import { assertLinkUsable } from "./utils/assertLinkUsable";
import { lockLinkContext } from "./utils/findLinkContext";

// What a request ended up doing, so the caller tells the hosts only when a
// request was actually made.
type RequestOutcome = {
    result: InviteRequestResult;
    newGuestId: string | null;
    spaceId: string;
};

type PendingValues = {
    inviteLinkId: string;
    status: typeof SPACE_GUEST_STATUSES.PENDING;
    statusReason: typeof SPACE_GUEST_STATUS_REASONS.AWAITING_RESPONSE;
    respondedBy: null;
    respondedAt: null;
    requestedAt: Date;
    expiresAt: Date;
};

const buildPendingValues = (
    inviteLinkId: string,
    now: Date
): PendingValues => ({
    inviteLinkId,
    status: SPACE_GUEST_STATUSES.PENDING,
    statusReason: SPACE_GUEST_STATUS_REASONS.AWAITING_RESPONSE,
    respondedBy: null,
    respondedAt: null,
    requestedAt: now,
    expiresAt: windowEnd(now),
});

const findGuestRow = async (
    tx: Transaction,
    spaceId: string,
    userId: string
): Promise<GuestRow | undefined> => {
    const [row] = await tx
        .select(guestRowSelect)
        .from(spaceGuestsTable)
        .where(
            and(
                eq(spaceGuestsTable.spaceId, spaceId),
                eq(spaceGuestsTable.userId, userId),
                isNull(spaceGuestsTable.deletedAt)
            )
        );
    return row;
};

// Spending the use is the check, so two requests on the last use cannot both
// pass.
const spendUse = async (tx: Transaction, linkId: string): Promise<void> => {
    const [spent] = await tx
        .update(spaceInviteLinksTable)
        .set({ usesCount: sql`${spaceInviteLinksTable.usesCount} + 1` })
        .where(
            and(
                eq(spaceInviteLinksTable.id, linkId),
                or(
                    isNull(spaceInviteLinksTable.maxUses),
                    lt(
                        spaceInviteLinksTable.usesCount,
                        spaceInviteLinksTable.maxUses
                    )
                )
            )
        )
        .returning({ id: spaceInviteLinksTable.id });

    if (!spent) throw new InviteLinkExhaustedError();
};

// Puts a denied or lapsed row back to waiting. Null when the row is not
// reopenable any more (another request got there first).
const reopenGuest = async (
    tx: Transaction,
    guestId: string,
    values: PendingValues,
    now: Date
): Promise<GuestRow | null> => {
    const [row] = await tx
        .update(spaceGuestsTable)
        .set(values)
        .where(
            and(
                eq(spaceGuestsTable.id, guestId),
                or(
                    eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.DENIED),
                    lte(spaceGuestsTable.expiresAt, now)
                )
            )
        )
        .returning(guestRowSelect);
    return row ?? null;
};

// Null when the person already has a row (a request from another tab won).
const insertGuest = async (
    tx: Transaction,
    spaceId: string,
    userId: string,
    values: PendingValues
): Promise<GuestRow | null> => {
    const [row] = await tx
        .insert(spaceGuestsTable)
        .values({ ...values, spaceId, userId })
        .onConflictDoNothing()
        .returning(guestRowSelect);
    return row ?? null;
};

const writePending = async (
    tx: Transaction,
    existing: GuestRow | undefined,
    target: { spaceId: string; userId: string; linkId: string },
    now: Date
): Promise<GuestRow | null> => {
    const values = buildPendingValues(target.linkId, now);
    if (existing) return reopenGuest(tx, existing.id, values, now);
    return insertGuest(tx, target.spaceId, target.userId, values);
};

const requestInTransaction = async (
    tx: Transaction,
    userId: string,
    token: string,
    now: Date
): Promise<RequestOutcome> => {
    const { link, space } = await lockLinkContext(token, tx);

    const membership = await findOrganizationMembership(
        userId,
        space.organizationId
    );
    if (membership) {
        return {
            result: { spaceId: space.id, isMember: true, guest: null },
            newGuestId: null,
            spaceId: space.id,
        };
    }

    const existing = await findGuestRow(tx, space.id, userId);
    if (existing && hasLivePass(existing, now)) {
        return {
            result: {
                spaceId: space.id,
                isMember: false,
                guest: serializeGuestState(existing, now),
            },
            newGuestId: null,
            spaceId: space.id,
        };
    }

    if (space.guestAccess === SPACE_GUEST_ACCESS.DISABLED) {
        throw new GuestAccessDisabledError();
    }
    assertLinkUsable(link, now);
    await spendUse(tx, link.id);

    const written = await writePending(
        tx,
        existing,
        { spaceId: space.id, userId, linkId: link.id },
        now
    );
    // Another request of the same person won the row between the read and the
    // write: this one only reports what is there.
    if (!written) {
        const current = await findGuestRow(tx, space.id, userId);
        return {
            result: {
                spaceId: space.id,
                isMember: false,
                guest: serializeOptionalGuestState(current, now),
            },
            newGuestId: null,
            spaceId: space.id,
        };
    }

    return {
        result: {
            spaceId: space.id,
            isMember: false,
            guest: serializeGuestState(written, now),
        },
        newGuestId: written.id,
        spaceId: space.id,
    };
};

/**
 * A person opens an invite and asks to enter. Never lets anyone in: it leaves
 * a pending request for a host. Asking again while the request is alive or the
 * person is inside changes nothing and spends no use. A denied, kicked or
 * lapsed guest asks again with the same row, as the Gather's reset does.
 */
export const requestInvite = async (
    userId: string,
    token: string
): Promise<InviteRequestResult> => {
    const now = new Date();
    const outcome = await db.transaction((tx) =>
        requestInTransaction(tx, userId, token, now)
    );

    if (outcome.newGuestId) {
        const guest = await loadGuest(outcome.spaceId, outcome.newGuestId);
        await publishSpaceGuestEvent({ type: "requested", guest });
    }

    return outcome.result;
};
