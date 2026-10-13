import type { LibraryTilesetDetail } from "@standin/contracts";
import { findScopedTileset } from "../utils/loadRows";
import { toTilesetDetail } from "../utils/toTilesetDetail";
import { findTilesetIdsInUse } from "../utils/usage";

/** One tileset with its grid and its `tileMeta`. */
export const getLibraryTileset = async (
    id: string,
    organizationId: string | null
): Promise<LibraryTilesetDetail> => {
    const tileset = await findScopedTileset(id, organizationId);
    const inUse = (await findTilesetIdsInUse([id])).has(id);
    return toTilesetDetail(tileset, inUse);
};
