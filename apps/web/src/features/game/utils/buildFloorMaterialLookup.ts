import {
    TILE_SIZE,
    getFloorMaterialAt,
    type FloorMaterial,
    type LayoutLibrary,
    type MapLayout,
    type Tileset,
} from "@standin/contracts";

type Point = { x: number; y: number };

/**
 * Answers "what floor is under the feet" for the map of a render payload. The
 * library is built once, so the answer is a lookup in the ground layer. Feet
 * on an empty cell, outside the map or on a tile with no material are on wood.
 */
export const buildFloorMaterialLookup = (
    layout: MapLayout,
    tilesets: readonly Tileset[]
): ((feet: Point) => FloorMaterial) => {
    const library: LayoutLibrary = {
        tilesets: Object.fromEntries(
            tilesets.map(({ id, tileCount, tileMeta }) => [
                id,
                { id, organizationId: null, tileCount, tileMeta },
            ])
        ),
    };

    return (feet) =>
        getFloorMaterialAt(
            layout,
            library,
            Math.floor(feet.x / TILE_SIZE),
            Math.floor(feet.y / TILE_SIZE)
        );
};
