import { TILE_SIZE, type EditorModel } from "@standin/contracts";
import type { ObjectLookup } from "@/features/editor/types/ObjectLookup";

// The maps the layout rules read, built once per query.
export const createObjectLookup = (
    model: Readonly<EditorModel>
): ObjectLookup => ({
    assetsById: new Map(model.library.assets.map((asset) => [asset.id, asset])),
    placedById: new Map(model.placed.map((placed) => [placed.id, placed])),
    mapHeightPx: model.height * TILE_SIZE,
});
