import { db, eq, mapsTable, spacesTable } from "@standin/database";
import { buildMapArena, type Arena } from "./buildArena";

export type LoadedArena = { arena: Arena; description: string };

// The map of the space, read from the database like the bots themselves are
// provisioned, so they walk on the floor of the map the person sees.
export const loadArena = async (spaceId: string): Promise<LoadedArena> => {
    const [row] = await db
        .select({
            width: mapsTable.width,
            height: mapsTable.height,
            tileSize: mapsTable.tileSize,
            layout: mapsTable.layout,
        })
        .from(spacesTable)
        .innerJoin(mapsTable, eq(mapsTable.id, spacesTable.mapId))
        .where(eq(spacesTable.id, spaceId))
        .limit(1);
    if (!row) throw new Error(`Map of space ${spaceId} not found.`);

    const arena = buildMapArena(row);
    return {
        arena,
        description: `map ${row.width}x${row.height} tiles (${arena.widthPx}x${arena.heightPx} px)`,
    };
};
