import type { LibraryPalette } from "../../../assets/types/library";
import type { MapRenderPayload } from "../../render/render-payload.schema";
import type { MapLayout } from "../../schemas/layout.schema";
import { ensureAreaFloorLayer } from "../../layout/ops/ensureAreaFloorLayer";
import type { EditorModel } from "../types/editor-model";

/**
 * Editor model from the render payload and the palette. The layout and the
 * placed objects are cloned, so editing the model never touches the inputs.
 */
export const buildEditorModel = (
    render: MapRenderPayload,
    library: LibraryPalette
): EditorModel => {
    const placed = structuredClone(render.placed);
    const layout = structuredClone(render.map.layout) as MapLayout;
    ensureAreaFloorLayer(layout);

    return {
        mapId: render.map.id,
        width: render.map.width,
        height: render.map.height,
        layout,
        placed,
        desks: structuredClone(render.desks),
        library,
        usedTilesets: structuredClone(render.tilesets),
        limits: { ...render.limits },
        version: render.map.layoutVersion,
        objectsRevision: render.objectsRevision,
    };
};
