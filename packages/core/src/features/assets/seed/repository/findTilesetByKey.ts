import { db, filesTable, tilesetsTable, and, eq } from "@standin/database";
import { liveTilesetInScope } from "../../utils/scope";

/** The live global tileset with this key and its stored file name, or null. */
export const findTilesetByKey = async (key: string) => {
    const [row] = await db
        .select({
            id: tilesetsTable.id,
            name: tilesetsTable.name,
            margin: tilesetsTable.margin,
            spacing: tilesetsTable.spacing,
            tileMeta: tilesetsTable.tileMeta,
            fileName: filesTable.fileName,
        })
        .from(tilesetsTable)
        .innerJoin(filesTable, eq(filesTable.id, tilesetsTable.fileId))
        .where(and(liveTilesetInScope(null), eq(tilesetsTable.key, key)));
    return row ?? null;
};
