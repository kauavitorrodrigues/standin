export type CanPlaceAssetOptions = {
    // The object a SURFACE item sits on.
    parentId?: string | null;
    // An object to leave out of every check, used when moving or replacing it.
    ignoreId?: string;
};
