import type { LibraryPalette } from "../../../assets/types/library";
import type { PlacedAsset } from "../../render/render-payload.schema";
import type { MapLayout } from "../../schemas/layout.schema";
import type { ModelDesk } from "./model-desk";

// Everything the editor needs to edit a map: the layout, the placed objects
// and the palette, with the object limit already counted.
export type EditorModel = {
    mapId: string;
    // Map size in tiles.
    width: number;
    height: number;
    layout: MapLayout;
    placed: PlacedAsset[];
    // Claimed desks. Only the server knows the owners, the editor never changes them
    // except by releasing a desk when its object is removed.
    desks: ModelDesk[];
    library: LibraryPalette;
    // The tilesets the layout declares, served even when the palette does not
    // list them (a deleted one). Layout math needs their tile count.
    usedTilesets?: LibraryPalette["tilesets"];
    limits: { objectsUsed: number; objectsMax: number };
    // The published layout version this model was built from.
    version: number;
};
