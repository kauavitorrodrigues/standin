import { db, organizationInviteLinksTable } from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    FIXED_INVITE_LINK_LIFETIME_DAYS,
    type OrganizationFixedLink,
} from "@standin/contracts";
import { lockByKey } from "../../../lib/advisoryLock";
import { readSealedToken, sealToken } from "../../../lib/crypto";
import { daysFromNow } from "../../../lib/daysFromNow";
import type { DbExecutor } from "../../../lib/types";
import {
    generateInviteToken,
    hashInviteToken,
} from "../../spaces/guests/invites/utils/generateToken";
import { fixedLinkSelect } from "./consts";
import type { FixedLinkLookup } from "./types";
import {
    findFixedLinkRow,
    isFixedLinkOf,
    serializeFixedLink,
} from "./utils/fixedLink";

// Everything about the fixed link of an organization runs one at a time, so a
// reset and a first ask can never leave two live links or hand back a dead one.
const withFixedLinkLock = <T>(
    organizationId: string,
    work: (tx: Transaction) => Promise<T>
): Promise<T> =>
    db.transaction(async (tx) => {
        await lockByKey(tx, `organization-fixed-link:${organizationId}`);
        return work(tx);
    });

const insertFixedLink = async (
    executor: DbExecutor,
    organizationId: string,
    createdBy: string
): Promise<OrganizationFixedLink> => {
    const token = generateInviteToken();
    const [row] = await executor
        .insert(organizationInviteLinksTable)
        .values({
            organizationId,
            createdBy,
            tokenHash: hashInviteToken(token),
            tokenEncrypted: sealToken(token),
            expiresAt: daysFromNow(FIXED_INVITE_LINK_LIFETIME_DAYS),
        })
        .returning(fixedLinkSelect);
    return serializeFixedLink(row, token);
};

const revokeFixedLinks = async (
    executor: DbExecutor,
    organizationId: string
): Promise<void> => {
    await executor
        .update(organizationInviteLinksTable)
        .set({ revokedAt: new Date() })
        .where(isFixedLinkOf(organizationId));
};

// The link and its token, when there is one and its token can be read.
const readFixedLink = async (
    executor: DbExecutor,
    organizationId: string
): Promise<FixedLinkLookup> => {
    const row = await findFixedLinkRow(organizationId, executor);
    if (!row) return { link: null, exists: false };

    const token = readSealedToken(row);
    if (!token) return { link: null, exists: true };
    return { link: serializeFixedLink(row, token), exists: true };
};

/**
 * The one member link of the organization. Made on the first ask and the same
 * after that. A link whose token cannot be read (the server secret changed) is
 * replaced.
 */
export const getFixedOrganizationLink = (
    organizationId: string,
    createdBy: string
): Promise<OrganizationFixedLink> =>
    withFixedLinkLock(organizationId, async (tx) => {
        const current = await readFixedLink(tx, organizationId);
        if (current.link) return current.link;

        if (current.exists) await revokeFixedLinks(tx, organizationId);
        return insertFixedLink(tx, organizationId, createdBy);
    });

/** Closes the fixed link and makes another. Who signed up through it stays. */
export const resetFixedOrganizationLink = (
    organizationId: string,
    createdBy: string
): Promise<OrganizationFixedLink> =>
    withFixedLinkLock(organizationId, async (tx) => {
        await revokeFixedLinks(tx, organizationId);
        return insertFixedLink(tx, organizationId, createdBy);
    });
