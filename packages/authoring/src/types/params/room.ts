export type RoomWalls =
    // The tileset by id or name, and a wall style named in its tile meta.
    | { tileset: string; style: string }
    // The tileset and one tile of the style, when the tile is known.
    | { tileset: string; tileIndex: number };

export type CreateRoomParams = {
    // The key doors point at. Unique on the map.
    key: string;
    label: string;
    // The room, in tiles. The walls stand on its border.
    x: number;
    y: number;
    width: number;
    height: number;
    // Left out, the room is a zone with no walls.
    walls?: RoomWalls;
    floor?: { tileset: string; tileIndex: number };
};
