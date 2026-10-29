export type PlaceObjectParams = {
    // The key of the asset in the library.
    asset: string;
    // The anchor cell, same meaning as a placed object: the bottom left cell.
    tileX: number;
    tileY: number;
    offsetX?: number;
    offsetY?: number;
    // The object it sits on, for a SURFACE asset.
    parentId?: string;
};
