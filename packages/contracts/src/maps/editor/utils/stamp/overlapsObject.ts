import type { EditorModel } from "../../types/editor-model";
import type { StampRect } from "../../types/stamp-rect";
import { getFootprintCells } from "../getFootprintCells";

/**
 * True when the footprint of a placed object touches the rectangle. An object
 * whose asset left the palette counts as its anchor cell. With `ignoreIds`,
 * those objects do not count (the ones that move with the area), and with
 * `except`, the cells inside that rectangle do not count either (what the
 * area already holds).
 */
export const overlapsObject = (
    model: EditorModel,
    rect: StampRect,
    ignoreIds: ReadonlySet<string> = new Set(),
    except?: StampRect
): boolean => {
    const assets = new Map(model.library.assets.map((item) => [item.id, item]));

    return model.placed.some((placed) => {
        if (ignoreIds.has(placed.id)) return false;
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
                y < rect.y + rect.h &&
                !(
                    except !== undefined &&
                    x >= except.x &&
                    x < except.x + except.w &&
                    y >= except.y &&
                    y < except.y + except.h
                )
        );
    });
};
