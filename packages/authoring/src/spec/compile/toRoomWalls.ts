import type { RoomWalls, SpecWallStyle } from "../../types";

/** The walls of a room as the builder takes them. The schema asks for one of the two. */
export const toRoomWalls = ({
    tileset,
    style,
    tileIndex,
}: SpecWallStyle): RoomWalls => {
    if (style !== undefined) return { tileset, style };

    return { tileset, tileIndex: tileIndex ?? 0 };
};
