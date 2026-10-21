import {
    and,
    eq,
    inArray,
    isNotNull,
    userIdentitiesTable,
    usersTable,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import type { IdentityKey } from "./types";

/**
 * Drops the link between a provider account and a deleted person. A deleted
 * person is never reactivated, so the provider account must be free to start a
 * new one. The link of an active person is left alone.
 */
export const releaseDeletedIdentity = async (
    tx: Transaction,
    { provider, providerUserId }: IdentityKey
) => {
    await tx
        .delete(userIdentitiesTable)
        .where(
            and(
                eq(userIdentitiesTable.provider, provider),
                eq(userIdentitiesTable.providerUserId, providerUserId),
                inArray(
                    userIdentitiesTable.userId,
                    tx
                        .select({ id: usersTable.id })
                        .from(usersTable)
                        .where(isNotNull(usersTable.deletedAt))
                )
            )
        );
};
