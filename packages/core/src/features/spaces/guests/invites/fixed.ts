import { db, spaceInviteLinksTable, eq } from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    FIXED_INVITE_LINK_LIFETIME_DAYS,
    type SpaceFixedLink,
} from "@standin/contracts";
import { lockByKey } from "../../../../lib/advisoryLock";
import { readSealedToken, sealToken } from "../../../../lib/crypto";
import { daysFromNow } from "../../../../lib/daysFromNow";
import type { DbExecutor } from "../../../../lib/types";
import { fixedLinkSelect } from "./consts/fixed";
import type { FixedLinkLookup } from "./types";
import {
    findFixedLinkRow,
    isFixedLinkOf,
    serializeFixedLink,
} from "./utils/fixedLink";
import { generateInviteToken, hashInviteToken } from "./utils/generateToken";

// Everything about the fixed link of a space runs one at a time, so a reset, a
// first ask and a change of validity can never leave two live links or hand
// back a dead one.
const withFixedLinkLock = <T>(
    spaceId: string,
    work: (tx: Transaction) => Promise<T>
): Promise<T> =>
    db.transaction(async (tx) => {
        await lockByKey(tx, `space-fixed-link:${spaceId}`);
        return work(tx);
    });

const insertFixedLink = async (
    executor: DbExecutor,
    spaceId: string,
    createdBy: string,
    guestValidityHours: number | null
): Promise<SpaceFixedLink> => {
    const token = generateInviteToken();
    const [row] = await executor
        .insert(spaceInviteLinksTable)
        .values({
            spaceId,
            createdBy,
            tokenHash: hashInviteToken(token),
            tokenEncrypted: sealToken(token),
            guestValidityHours,
            expiresAt: daysFromNow(FIXED_INVITE_LINK_LIFETIME_DAYS),
        })
        .returning(fixedLinkSelect);
    return serializeFixedLink(row, token);
};

// Closes the fixed link and tells the validity it had, so the next one keeps it.
const revokeFixedLinks = async (
    executor: DbExecutor,
    spaceId: string
): Promise<number | null> => {
    const [closed] = await executor
        .update(spaceInviteLinksTable)
        .set({ revokedAt: new Date() })
        .where(isFixedLinkOf(spaceId))
        .returning({ hours: spaceInviteLinksTable.guestValidityHours });
    return closed?.hours ?? null;
};

// The link and its token, when there is one and its token can be read.
const readFixedLink = async (
    executor: DbExecutor,
    spaceId: string
): Promise<FixedLinkLookup> => {
    const row = await findFixedLinkRow(spaceId, executor);
    if (!row) return { link: null, exists: false };

    const token = readSealedToken(row);
    if (!token) return { link: null, exists: true };
    return { link: serializeFixedLink(row, token), exists: true };
};

/**
 * The one link of the space. Made on the first ask, the same one after that, so
 * the hosts can copy it any time. A link whose token cannot be read (the
 * server secret changed) is replaced.
 */
export const getFixedInviteLink = (
    spaceId: string,
    createdBy: string
): Promise<SpaceFixedLink> =>
    withFixedLinkLock(spaceId, async (tx) => {
        const current = await readFixedLink(tx, spaceId);
        if (current.link) return current.link;

        const validity = current.exists
            ? await revokeFixedLinks(tx, spaceId)
            : null;
        return insertFixedLink(tx, spaceId, createdBy, validity);
    });

/** Closes the fixed link and makes another, keeping the guest validity. */
export const resetFixedInviteLink = (
    spaceId: string,
    createdBy: string
): Promise<SpaceFixedLink> =>
    withFixedLinkLock(spaceId, async (tx) => {
        const validity = await revokeFixedLinks(tx, spaceId);
        return insertFixedLink(tx, spaceId, createdBy, validity);
    });

/** Sets how long the guests of the link keep the access once admitted. */
export const setGuestValidity = (
    spaceId: string,
    createdBy: string,
    guestValidityHours: number | null
): Promise<SpaceFixedLink> =>
    withFixedLinkLock(spaceId, async (tx) => {
        const current = await readFixedLink(tx, spaceId);
        if (!current.link) {
            if (current.exists) await revokeFixedLinks(tx, spaceId);
            return insertFixedLink(tx, spaceId, createdBy, guestValidityHours);
        }

        const [row] = await tx
            .update(spaceInviteLinksTable)
            .set({ guestValidityHours })
            .where(eq(spaceInviteLinksTable.id, current.link.id))
            .returning(fixedLinkSelect);
        return serializeFixedLink(row, current.link.token);
    });
