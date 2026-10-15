import { TILE_CATEGORIES } from "../../../../assets/enums/tile-category";
import { LAYOUT_LAYER_NAMES } from "../../../schemas/layout.schema";
import type { EditorModel } from "../../types/editor-model";
import { getTileMetaAt } from "./getTileMetaAt";

/** True when the walls layer has a WALL tile on the cell, solid or not. */
export const isWallTile = (model: EditorModel, x: number, y: number): boolean =>
    getTileMetaAt(model, LAYOUT_LAYER_NAMES.WALLS, x, y)?.category ===
    TILE_CATEGORIES.WALL;
