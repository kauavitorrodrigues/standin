import { and, db, eq, isNull, serviceTokensTable } from "@standin/database";
import type { ServiceToken } from "@standin/contracts";
import type { RegenerateServiceTokenInput } from "../types";
import { serviceTokenSelect } from "./columns";

// Swaps the secret of the row and nothing else of its settings. The revoked
// check is in the query too, so a token revoked a moment ago is not revived
// by a request that read it as active.
export const regenerateServiceToken = async (
    id: string,
    input: RegenerateServiceTokenInput
): Promise<ServiceToken | null> => {
    const [row] = await db
        .update(serviceTokensTable)
        .set({
            tokenHash: input.tokenHash,
            tokenPrefix: input.tokenPrefix,
            lastUsedAt: null,
            updatedAt: input.now,
        })
        .where(
            and(
                eq(serviceTokensTable.id, id),
                isNull(serviceTokensTable.revokedAt)
            )
        )
        .returning(serviceTokenSelect);
    return row ?? null;
};
