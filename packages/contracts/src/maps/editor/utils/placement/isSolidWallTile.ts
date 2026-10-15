import { TILE_CATEGORIES } from "../../../../assets/enums/tile-category";
import { LAYOUT_LAYER_NAMES } from "../../../schemas/layout.schema";
import type { EditorModel } from "../../types/editor-model";
import { getTileMetaAt } from "./getTileMetaAt";

/** True when the walls layer has a solid WALL tile on the cell. */
export const isSolidWallTile = (
    model: EditorModel,
    x: number,
    y: number
): boolean => {
    const meta = getTileMetaAt(model, LAYOUT_LAYER_NAMES.WALLS, x, y);
    return meta?.category === TILE_CATEGORIES.WALL && meta.solid === true;
};
