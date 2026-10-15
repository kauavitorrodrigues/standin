import type { LibraryPalette } from "../../../assets/types/library";
import type { LayoutLibrary } from "../../layout/library";

/**
 * Palette as the pure layout functions read it: tilesets by id, with the
 * count and the tile meta that computeGid, ensureTileset and applyOp need.
 * `used` are the tilesets the layout already declares, which the palette can
 * leave out (a deleted one, for example) while the gids still depend on them.
 * The palette wins when both have the same id.
 */
export const toLayoutLibrary = (
    palette: LibraryPalette,
    used: LibraryPalette["tilesets"] = []
): LayoutLibrary => ({
    tilesets: Object.fromEntries(
        [...used, ...palette.tilesets].map(({ id, tileCount, tileMeta }) => [
            id,
            {
                id,
                // The palette does not tell the owner, and the visible
                // tilesets are already scoped to the map by the server.
                organizationId: null,
                tileCount,
                tileMeta,
            },
        ])
    ),
});
