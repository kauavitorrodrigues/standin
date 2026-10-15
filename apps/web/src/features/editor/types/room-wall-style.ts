// A wall style the room panel can draw with: a complete one, with the tile of
// its front wall that stands for it.
export type RoomWallStyle = {
    // The tileset and the tile joined, the value the field keeps.
    value: string;
    label: string;
    tilesetId: string;
    tileIndex: number;
};
