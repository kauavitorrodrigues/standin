import { serviceTokensTable } from "@standin/database";

// Everything the API may send. The hash is left out on purpose, so no query
// can leak it.
export const serviceTokenSelect = {
    id: serviceTokensTable.id,
    name: serviceTokensTable.name,
    tokenPrefix: serviceTokensTable.tokenPrefix,
    scopes: serviceTokensTable.scopes,
    createdById: serviceTokensTable.createdById,
    lastUsedAt: serviceTokensTable.lastUsedAt,
    expiresAt: serviceTokensTable.expiresAt,
    revokedAt: serviceTokensTable.revokedAt,
    createdAt: serviceTokensTable.createdAt,
    updatedAt: serviceTokensTable.updatedAt,
};
