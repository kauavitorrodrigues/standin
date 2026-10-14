import type { EditorModel } from "../../types/editor-model";
import type { StampRect } from "../../types/stamp-rect";
import { getFootprintCells } from "../getFootprintCells";

/**
 * True when the footprint of a placed object touches the rectangle. An object
 * whose asset left the palette counts as its anchor cell.
 */
export const overlapsObject = (
    model: EditorModel,
    rect: StampRect
): boolean => {
    const assets = new Map(model.library.assets.map((item) => [item.id, item]));

    return model.placed.some((placed) => {
        const footprint = assets.get(placed.assetId)?.footprint;

        return getFootprintCells({
            tileX: placed.tileX,
            tileY: placed.tileY,
            width: footprint?.w ?? 1,
            height: footprint?.h ?? 1,
        }).some(
            ({ x, y }) =>
                x >= rect.x &&
                x < rect.x + rect.w &&
                y >= rect.y &&
                y < rect.y + rect.h
        );
    });
};
