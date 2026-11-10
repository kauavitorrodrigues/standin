import { appConnectionsTable } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { UpsertAppConnectionInput } from "../types";

/** Connecting again replaces the tokens of the same person. */
export const upsertConnection = async (
    executor: DbExecutor,
    input: UpsertAppConnectionInput
): Promise<void> => {
    await executor
        .insert(appConnectionsTable)
        .values(input)
        .onConflictDoUpdate({
            target: [
                appConnectionsTable.organizationId,
                appConnectionsTable.userId,
                appConnectionsTable.provider,
                appConnectionsTable.service,
            ],
            set: {
                accountId: input.accountId,
                accountImageUrl: input.accountImageUrl,
                refreshTokenSealed: input.refreshTokenSealed,
                scope: input.scope,
            },
        });
};
