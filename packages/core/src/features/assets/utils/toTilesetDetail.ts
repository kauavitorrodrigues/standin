import type {
    LibraryTilesetDetail,
    LibraryTilesetSummary,
} from "@standin/contracts";
import type { TilesetRow } from "../types";
import { buildFileUrl } from "../../../lib/buildFileUrl";

export const toTilesetSummary = async (
    row: TilesetRow,
    inUse: boolean
): Promise<LibraryTilesetSummary> => {
    const taggedCount = Object.keys(row.tileMeta ?? {}).length;
    return {
        id: row.id,
        key: row.key,
        name: row.name,
        url: buildFileUrl(row.fileId),
        widthPx: row.widthPx,
        heightPx: row.heightPx,
        tileCount: row.tileCount,
        columns: row.columns,
        taggedCount,
        progressPercent: Math.round((taggedCount / row.tileCount) * 100),
        inUse,
    };
};

export const toTilesetDetail = async (
    row: TilesetRow,
    inUse: boolean
): Promise<LibraryTilesetDetail> => ({
    ...(await toTilesetSummary(row, inUse)),
    margin: row.margin,
    spacing: row.spacing,
    tileMeta: row.tileMeta,
});
