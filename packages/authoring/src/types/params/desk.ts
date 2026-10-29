// Where an object goes: its asset key and anchor cell.
export type DeskSpot = {
    asset: string;
    tileX: number;
    tileY: number;
    offsetX?: number;
    offsetY?: number;
};

export type PlaceDeskParams = {
    // The key of the DESK asset, and the cell of its anchor (bottom left).
    desk: string;
    tileX: number;
    tileY: number;
    // SURFACE assets that sit on the desk (a monitor), placed with the desk as
    // their parent.
    items?: DeskSpot[];
    // CHAIR assets next to the desk. A chair is an ordinary object whose
    // `SIT` action tells where the person sits, so it is placed where it
    // should stand and nothing else is computed.
    chairs?: DeskSpot[];
};
