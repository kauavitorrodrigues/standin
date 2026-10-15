export type CanPlaceAssetOptions = {
    // The object a SURFACE item sits on.
    parentId?: string | null;
    // An object to leave out of every check, used when moving or replacing it.
    ignoreId?: string;
    // The pixel offset of the object from its anchor cell. Two GROUND objects
    // overlap by where they are drawn, so it counts for the overlap.
    offsetX?: number;
    offsetY?: number;
};
