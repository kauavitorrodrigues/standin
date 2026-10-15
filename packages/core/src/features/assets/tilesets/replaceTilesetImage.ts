import { tilesetsTable, eq } from "@standin/database";
import {
    GridMismatchIssue,
    LibraryValidationError,
    TilesetInUseError,
} from "@standin/contracts";
import type { LibraryIssue } from "@standin/contracts";
import { softDeleteFile } from "../library/utils/softDeleteFile";
import type { UploadedImage } from "../types";
import { countTiles } from "../utils/countTiles";
import { findScopedTileset } from "../utils/loadRows";
import { readUploadedPng } from "../utils/readUploadedPng";
import { findTilesetIdsInUse } from "../utils/usage";
import { withStoredFile } from "../utils/withStoredFile";

type Grid = { margin?: number; spacing?: number };

/**
 * Replaces the sheet of a tileset that no map paints with. It is not exposed
 * by the API (to change a PNG there, create another tileset and delete the
 * old one), only the seed uses it to keep an existing key up to date.
 */
export const replaceLibraryTilesetImage = async (
    id: string,
    organizationId: string | null,
    image: UploadedImage,
    grid: Grid = {}
): Promise<void> => {
    const tileset = await findScopedTileset(id, organizationId);
    if ((await findTilesetIdsInUse([id])).has(id)) {
        throw new TilesetInUseError();
    }

    const { size, issues } = readUploadedPng(image.buffer);
    const errors: LibraryIssue[] = [...issues];
    const margin = grid.margin ?? tileset.margin;
    const spacing = grid.spacing ?? tileset.spacing;
    let columns = 0;
    let tileCount = 0;
    if (size) {
        const across = countTiles(size.width, margin, spacing);
        const down = countTiles(size.height, margin, spacing);
        if (across === null || down === null) {
            errors.push(
                new GridMismatchIssue(
                    { widthPx: size.width, heightPx: size.height },
                    { margin, spacing }
                )
            );
        } else {
            columns = across;
            tileCount = across * down;
        }
    }
    if (errors.length > 0 || !size) throw new LibraryValidationError(errors);

    await withStoredFile(image, async (tx, fileId) => {
        await tx
            .update(tilesetsTable)
            .set({
                fileId,
                widthPx: size.width,
                heightPx: size.height,
                columns,
                tileCount,
                margin,
                spacing,
            })
            .where(eq(tilesetsTable.id, id));
        await softDeleteFile(tileset.fileId, tx);
    });
};
