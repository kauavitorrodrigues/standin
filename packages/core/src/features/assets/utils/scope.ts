import { assetsTable, tilesetsTable, and, eq, isNull } from "@standin/database";
import { ScopeForbiddenError } from "@standin/contracts";

// Rows of one scope: the global library (null) or one organization's.
export const tilesetInScope = (organizationId: string | null) =>
    organizationId === null
        ? isNull(tilesetsTable.organizationId)
        : eq(tilesetsTable.organizationId, organizationId);

export const liveTilesetInScope = (organizationId: string | null) =>
    and(tilesetInScope(organizationId), isNull(tilesetsTable.deletedAt));

export const assetInScope = (organizationId: string | null) =>
    organizationId === null
        ? isNull(assetsTable.organizationId)
        : eq(assetsTable.organizationId, organizationId);

export const liveAssetInScope = (organizationId: string | null) =>
    and(assetInScope(organizationId), isNull(assetsTable.deletedAt));

/**
 * An `organizationId` in a request body is refused until the library of the
 * organization exists. Only the global library is writable for now.
 */
export const assertGlobalScope = (organizationId?: string | null): void => {
    if (organizationId !== undefined && organizationId !== null) {
        throw new ScopeForbiddenError();
    }
};
