import { db, tilesetsTable, eq } from "@standin/database";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { findScopedTileset } from "../utils/loadRows";
import { getLibraryTileset } from "./getTileset";

export const renameLibraryTileset = async (
    id: string,
    organizationId: string | null,
    name: string
): Promise<LibraryTilesetDetail> => {
    await findScopedTileset(id, organizationId);
    await db
        .update(tilesetsTable)
        .set({ name })
        .where(eq(tilesetsTable.id, id));
    return getLibraryTileset(id, organizationId);
};
