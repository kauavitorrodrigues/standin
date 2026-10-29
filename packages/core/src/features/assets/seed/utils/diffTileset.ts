import { stableJson } from "../../library/utils/stableJson";
import type {
    SeedTileset,
    SeedTilesetChanges,
    SeedTilesetCurrent,
} from "../types";

/** What of a tileset differs from its entry. A field left out is not compared. */
export const diffTileset = (
    entry: SeedTileset,
    current: SeedTilesetCurrent
): SeedTilesetChanges => ({
    gridChanged:
        (entry.margin ?? current.margin) !== current.margin ||
        (entry.spacing ?? current.spacing) !== current.spacing,
    metaChanged:
        entry.tileMeta !== undefined &&
        stableJson(entry.tileMeta) !== stableJson(current.tileMeta),
    nameChanged: entry.name !== current.name,
});
