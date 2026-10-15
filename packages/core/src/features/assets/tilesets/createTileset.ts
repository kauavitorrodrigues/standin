import { db, tilesetsTable } from "@standin/database";
import { GridMismatchIssue, LibraryValidationError } from "@standin/contracts";
import type {
    CreateTilesetData,
    LibraryIssue,
    LibraryTilesetDetail,
} from "@standin/contracts";
import type { LibraryContext, UploadedImage } from "../types";
import { countTiles } from "../utils/countTiles";
import { resolveTilesetKey } from "../utils/keys";
import { readUploadedPng } from "../utils/readUploadedPng";
import { assertGlobalScope, liveTilesetInScope } from "../utils/scope";
import {
    findBlankDefaultIssues,
    findTileMetaRangeIssues,
} from "../library/utils/validateTileMeta";
import { withStoredFile } from "../utils/withStoredFile";
import { getLibraryTileset } from "./getTileset";

/**
 * Creates a tileset from a PNG sheet on a 32 px grid. The server reads the
 * size from the PNG and computes `columns` and `tileCount`. Every problem is
 * collected before anything is written.
 */
export const createLibraryTileset = async (
    image: UploadedImage | undefined,
    data: CreateTilesetData,
    { organizationId, createdBy }: LibraryContext
): Promise<LibraryTilesetDetail> => {
    assertGlobalScope(data.organizationId);

    const { size, issues } = readUploadedPng(image?.buffer);
    const errors: LibraryIssue[] = [...issues];
    const margin = data.margin ?? 0;
    const spacing = data.spacing ?? 0;

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

    if (data.tileMeta && tileCount > 0) {
        errors.push(...findTileMetaRangeIssues(data.tileMeta, tileCount));
        if (organizationId === null) {
            const others = await db
                .select({
                    id: tilesetsTable.id,
                    tileCount: tilesetsTable.tileCount,
                    tileMeta: tilesetsTable.tileMeta,
                })
                .from(tilesetsTable)
                .where(liveTilesetInScope(null));
            errors.push(
                ...findBlankDefaultIssues([
                    ...others,
                    { id: "new", tileCount, tileMeta: data.tileMeta },
                ])
            );
        }
    }
    if (errors.length > 0 || !size || !image) {
        throw new LibraryValidationError(errors);
    }

    const key = await resolveTilesetKey(data.key, data.name, organizationId);
    const id = await withStoredFile(image, async (tx, fileId) => {
        const [created] = await tx
            .insert(tilesetsTable)
            .values({
                organizationId,
                fileId,
                createdBy,
                key,
                name: data.name,
                widthPx: size.width,
                heightPx: size.height,
                columns,
                tileCount,
                margin,
                spacing,
                tileMeta: data.tileMeta ?? null,
            })
            .returning({ id: tilesetsTable.id });
        return created!.id;
    });

    return getLibraryTileset(id, organizationId);
};
