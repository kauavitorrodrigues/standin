import { db } from "@standin/database";
import type { MapSizeTier, MapTemplatePreview } from "@standin/contracts";
import { toTilesets } from "../assets/utils/toDefinitions";
import { buildBlankMapValues } from "./utils/buildBlankMapValues";
import { completeLayout } from "./utils/completeLayout";
import { loadTilesetRows } from "./utils/loadTilesetRows";
import { toTilesetRowMap } from "./utils/toTilesetRowMap";

/**
 * How a blank map of a tier looks (floor, walls and nothing placed), built
 * from the same defaults `createBlank` uses but never stored. For the page
 * that starts a space, so it can show the map the user is going to get.
 */
export const previewBlankMap = async (
    sizeTier: MapSizeTier
): Promise<MapTemplatePreview> => {
    const values = await buildBlankMapValues(sizeTier, db);

    const tilesetRows = await loadTilesetRows(
        values.layout.tilesets.map(({ name }) => name)
    );
    const { layout } = await completeLayout(
        values.layout,
        toTilesetRowMap(tilesetRows)
    );

    return {
        map: {
            id: `blank-${sizeTier}`,
            width: values.width,
            height: values.height,
            tileSize: values.tileSize,
            layoutVersion: values.layoutVersion,
            layout,
        },
        tilesets: await toTilesets(tilesetRows),
        assets: [],
        placed: [],
    };
};
