import {
    db,
    organizationInvitesTable,
    and,
    eq,
    gt,
    isNotNull,
    isNull,
    notInArray,
} from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { FreeDesk } from "@standin/contracts";
import { DeskService } from "../../maps/desks";

// Leaves out the invitations of these e-mails. Nothing to leave out: no filter.
const isNotAnyOf = (emails: string[]) => {
    if (emails.length === 0) return undefined;
    return notInArray(organizationInvitesTable.email, emails);
};

/**
 * The desks of a space that open invitations already keep. The invitations of
 * `exceptEmails` do not count: renewing one may keep its own desk.
 */
export const listReservedDeskIds = async (
    organizationId: string,
    spaceId: string,
    exceptEmails: string[] = [],
    executor: DbExecutor = db
): Promise<string[]> => {
    const rows = await executor
        .select({ mapAssetId: organizationInvitesTable.mapAssetId })
        .from(organizationInvitesTable)
        .where(
            and(
                eq(organizationInvitesTable.organizationId, organizationId),
                eq(organizationInvitesTable.spaceId, spaceId),
                isNotNull(organizationInvitesTable.mapAssetId),
                isNull(organizationInvitesTable.deletedAt),
                isNull(organizationInvitesTable.acceptedAt),
                gt(organizationInvitesTable.expiresAt, new Date()),
                isNotAnyOf(exceptEmails)
            )
        );
    return rows.flatMap((row) => (row.mapAssetId ? [row.mapAssetId] : []));
};

/** The free desks of a space that no open invitation keeps either. */
export const listDesksToKeep = async (
    organizationId: string,
    spaceId: string,
    exceptEmails: string[] = []
): Promise<FreeDesk[]> => {
    const [free, reserved] = await Promise.all([
        DeskService.listFree(spaceId),
        listReservedDeskIds(organizationId, spaceId, exceptEmails),
    ]);
    const taken = new Set(reserved);
    return free.filter((desk) => !taken.has(desk.mapAssetId));
};
