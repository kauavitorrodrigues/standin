import {
    db,
    organizationInviteLinksTable,
    and,
    eq,
    isNotNull,
    isNull,
} from "@standin/database";
import type { OrganizationFixedLink } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";
import { fixedLinkSelect } from "../consts";
import type { FixedLinkRow } from "../types";

/** A link that is alive and keeps its token: the fixed one of the organization. */
export const isFixedLinkOf = (organizationId: string) =>
    and(
        eq(organizationInviteLinksTable.organizationId, organizationId),
        isNull(organizationInviteLinksTable.deletedAt),
        isNull(organizationInviteLinksTable.revokedAt),
        isNotNull(organizationInviteLinksTable.tokenEncrypted)
    );

export const findFixedLinkRow = async (
    organizationId: string,
    executor: DbExecutor = db
): Promise<FixedLinkRow | undefined> => {
    const [row] = await executor
        .select(fixedLinkSelect)
        .from(organizationInviteLinksTable)
        .where(isFixedLinkOf(organizationId));
    return row;
};

export const serializeFixedLink = (
    row: FixedLinkRow,
    token: string
): OrganizationFixedLink => ({
    id: row.id,
    organizationId: row.organizationId,
    token,
    createdAt: row.createdAt.toISOString(),
});
