import type { LibraryPalette } from "../../../assets/types/library";
import { TILE_SIZE } from "../../consts/constants";
import { TILED_LAYER_TYPES } from "../../enums/tiled-layer-type";
import {
    LAYOUT_ZONES_LAYER_NAME,
    type LayoutTileLayer,
    type MapLayout,
} from "../../schemas/layout.schema";
import { STAMP_LAYER_ORDER } from "../consts/stamp-layer-order";
import { STAMP_MAX_OBJECTS } from "../consts/limits";
import type { EditorModel } from "../types/editor-model";

type BlankModelInput = {
    width: number;
    height: number;
    library: LibraryPalette;
};

const buildTileLayer = (
    id: number,
    name: string,
    width: number,
    height: number
): LayoutTileLayer => ({
    id,
    type: TILED_LAYER_TYPES.TILE_LAYER,
    name,
    x: 0,
    y: 0,
    width,
    height,
    visible: true,
    opacity: 1,
    data: new Array<number>(width * height).fill(0),
});

/**
 * Empty model for the area composer and for validateStamp: the four tile
 * layers zeroed, no tilesets, no spawn, no zones and no objects. It does not
 * go through validateLayout, which asks for a 12 x 8 map and a spawn, because
 * an area can be as small as 2 x 2.
 */
export const buildBlankEditorModel = ({
    width,
    height,
    library,
}: BlankModelInput): EditorModel => {
    const layout: MapLayout = {
        orientation: "orthogonal",
        renderorder: "right-down",
        infinite: false,
        tilewidth: TILE_SIZE,
        tileheight: TILE_SIZE,
        width,
        height,
        nextlayerid: STAMP_LAYER_ORDER.length + 2,
        nextobjectid: 1,
        tilesets: [],
        layers: [
            ...STAMP_LAYER_ORDER.map((name, index) =>
                buildTileLayer(index + 1, name, width, height)
            ),
            {
                id: STAMP_LAYER_ORDER.length + 1,
                type: TILED_LAYER_TYPES.OBJECT_GROUP,
                name: LAYOUT_ZONES_LAYER_NAME,
                x: 0,
                y: 0,
                visible: true,
                opacity: 1,
                objects: [],
            },
        ],
    };

    return {
        mapId: "",
        width,
        height,
        layout,
        placed: [],
        desks: [],
        library,
        limits: { objectsUsed: 0, objectsMax: STAMP_MAX_OBJECTS },
        version: 0,
    };
};
