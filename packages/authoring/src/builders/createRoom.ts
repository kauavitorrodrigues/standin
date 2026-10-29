import { TILE_SIZE, buildRoomWallOps } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import { checkOps } from "../internal/checkOps";
import { checkRectInMap } from "../internal/checkRectInMap";
import { fail } from "../internal/fail";
import { createLibraryIndex } from "../library/createLibraryIndex";
import type { BuildResult, CreateRoomParams } from "../types";
import { buildFloorOps } from "./room/buildFloorOps";
import { resolveWallTile } from "./room/resolveWallTile";

/**
 * A private room: an optional floor, the outline of walls, then the zone with
 * its key. The walls come from `buildRoomWallOps`, which picks the piece of
 * each cell from its neighbors, so the style only has to be complete.
 */
export const createRoom = (
    model: EditorModel,
    params: CreateRoomParams
): BuildResult => {
    const { key, label, x, y, width, height, walls, floor } = params;
    const outside = checkRectInMap(model, "room", {
        x,
        y,
        w: width,
        h: height,
    });
    if (outside.length > 0) return fail(...outside);

    const index = createLibraryIndex(model.library);
    const ops: EditorOp[] = [];

    if (floor) {
        const tileset = index.tileset(floor.tileset);
        if (!tileset.ok) return fail(tileset.issue);
        ops.push(...buildFloorOps(tileset.value.id, floor.tileIndex, params));
    }

    if (walls) {
        const tileset = index.tileset(walls.tileset);
        if (!tileset.ok) return fail(tileset.issue);
        const tile = resolveWallTile(tileset.value, walls);
        if (!tile.ok) return fail(tile.issue);

        const built = buildRoomWallOps(
            {
                x: x * TILE_SIZE,
                y: y * TILE_SIZE,
                width: width * TILE_SIZE,
                height: height * TILE_SIZE,
            },
            tileset.value.id,
            tile.tileIndex
        );
        if (!built.ok) return fail(...built.errors);
        ops.push(...built.ops);
    }

    ops.push({
        type: "set_zone",
        zone: {
            kind: "private",
            key,
            label,
            rect: { x, y, w: width, h: height },
        },
    });

    return checkOps(model, ops);
};
